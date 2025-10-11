import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '../config/database.js';

class User {
  constructor(userData) {
    this._id = userData._id || new ObjectId();
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.avatar = userData.avatar || null;
    this.role = userData.role || 'user';
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.isEmailVerified = userData.isEmailVerified || false;
    this.emailVerificationToken = userData.emailVerificationToken || null;
    this.emailVerificationExpire = userData.emailVerificationExpire || null;
    this.resetPasswordToken = userData.resetPasswordToken || null;
    this.resetPasswordExpire = userData.resetPasswordExpire || null;
    this.lastLogin = userData.lastLogin || new Date();
    this.loginAttempts = userData.loginAttempts || 0;
    this.lockUntil = userData.lockUntil || null;
    this.preferences = userData.preferences || {
      theme: 'dark',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        priceAlerts: true
      },
      watchlist: []
    };
    this.wallet = userData.wallet || {
      balance: 10000, // Starting balance in USD
      holdings: [],
      transactions: []
    };
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  // Virtual for full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual for account lock status
  get isLocked() {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }

  // Instance method to check password
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Instance method to generate JWT token
  getSignedJwtToken() {
    return jwt.sign(
      { id: this._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Instance method to save user
  async save() {
    try {
      const collection = getCollection('users');
      this.updatedAt = new Date();
      
      if (this._id && await User.findById(this._id)) {
        // Update existing user
        const { _id, ...updateData } = this;
        await collection.updateOne(
          { _id: new ObjectId(this._id) },
          { $set: updateData }
        );
      } else {
        // Create new user
        const result = await collection.insertOne(this);
        this._id = result.insertedId;
      }
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Static method to create user
  static async create(userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Static method to find user by ID
  static async findById(id) {
    try {
      const collection = getCollection('users');
      const userData = await collection.findOne({ _id: new ObjectId(id) });
      return userData ? new User(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Static method to find one user
  static async findOne(query) {
    try {
      const collection = getCollection('users');
      const userData = await collection.findOne(query);
      return userData ? new User(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Static method to find user by credentials
  static async findByCredentials(email, password) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check if account is locked
      if (user.isLocked) {
        await user.incLoginAttempts();
        throw new Error('Account temporarily locked due to too many failed login attempts');
      }
      
      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      // Check password
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        await user.incLoginAttempts();
        throw new Error('Invalid email or password');
      }
      
      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Instance method to handle failed login attempts
  async incLoginAttempts() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
      this.lockUntil = null;
      this.loginAttempts = 1;
    } else {
      this.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 2 hours
      if (this.loginAttempts >= 5 && !this.isLocked) {
        this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }
    }
    
    return await this.save();
  }

  // Instance method to reset login attempts
  async resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockUntil = null;
    return await this.save();
  }

  // Instance method to buy crypto
  async buyCrypto(symbol, amount, price) {
    const total = amount * price;
    
    if (this.wallet.balance < total) {
      throw new Error('Insufficient balance');
    }
    
    // Update balance
    this.wallet.balance -= total;
    
    // Find existing holding
    const existingHoldingIndex = this.wallet.holdings.findIndex(h => h.symbol === symbol);
    
    if (existingHoldingIndex !== -1) {
      // Update existing holding
      const existingHolding = this.wallet.holdings[existingHoldingIndex];
      const newTotalInvested = existingHolding.totalInvested + total;
      const newAmount = existingHolding.amount + amount;
      
      this.wallet.holdings[existingHoldingIndex] = {
        ...existingHolding,
        averagePrice: newTotalInvested / newAmount,
        amount: newAmount,
        totalInvested: newTotalInvested
      };
    } else {
      // Add new holding
      this.wallet.holdings.push({
        symbol,
        amount,
        averagePrice: price,
        totalInvested: total,
        purchaseDate: new Date()
      });
    }
    
    // Add transaction
    this.wallet.transactions.push({
      type: 'buy',
      symbol,
      amount,
      price,
      total,
      timestamp: new Date()
    });
    
    return await this.save();
  }

  // Instance method to sell crypto
  async sellCrypto(symbol, amount, price) {
    const holdingIndex = this.wallet.holdings.findIndex(h => h.symbol === symbol);
    
    if (holdingIndex === -1 || this.wallet.holdings[holdingIndex].amount < amount) {
      throw new Error('Insufficient crypto holdings');
    }
    
    const total = amount * price;
    const holding = this.wallet.holdings[holdingIndex];
    
    // Update balance
    this.wallet.balance += total;
    
    // Update holding
    holding.amount -= amount;
    holding.totalInvested -= (holding.averagePrice * amount);
    
    // Remove holding if amount is 0
    if (holding.amount === 0) {
      this.wallet.holdings.splice(holdingIndex, 1);
    }
    
    // Add transaction
    this.wallet.transactions.push({
      type: 'sell',
      symbol,
      amount,
      price,
      total,
      timestamp: new Date()
    });
    
    return await this.save();
  }

  // Instance method to get portfolio value
  getPortfolioValue(currentPrices = {}) {
    let totalValue = this.wallet.balance;
    
    this.wallet.holdings.forEach(holding => {
      const currentPrice = currentPrices[holding.symbol] || holding.averagePrice;
      totalValue += holding.amount * currentPrice;
    });
    
    return totalValue;
  }

  // Static method to get user statistics
  static async getStats() {
    try {
      const collection = getCollection('users');
      
      const totalUsers = await collection.countDocuments();
      const activeUsers = await collection.countDocuments({ isActive: true });
      const verifiedUsers = await collection.countDocuments({ isEmailVerified: true });
      const recentUsers = await collection.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      });
      
      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers,
        inactiveUsers: totalUsers - activeUsers,
        unverifiedUsers: totalUsers - verifiedUsers
      };
    } catch (error) {
      throw error;
    }
  }
}

export default User;