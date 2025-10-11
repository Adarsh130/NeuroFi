import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';

class Crypto {
  constructor(cryptoData) {
    this._id = cryptoData._id || new ObjectId();
    this.symbol = cryptoData.symbol?.toUpperCase();
    this.name = cryptoData.name;
    this.currentPrice = cryptoData.currentPrice;
    this.priceChange24h = cryptoData.priceChange24h || 0;
    this.priceChangePercentage24h = cryptoData.priceChangePercentage24h || 0;
    this.high24h = cryptoData.high24h;
    this.low24h = cryptoData.low24h;
    this.volume24h = cryptoData.volume24h;
    this.marketCap = cryptoData.marketCap || null;
    this.circulatingSupply = cryptoData.circulatingSupply || null;
    this.totalSupply = cryptoData.totalSupply || null;
    this.maxSupply = cryptoData.maxSupply || null;
    this.ath = cryptoData.ath || null;
    this.athDate = cryptoData.athDate || null;
    this.atl = cryptoData.atl || null;
    this.atlDate = cryptoData.atlDate || null;
    this.lastUpdated = cryptoData.lastUpdated || new Date();
    this.priceHistory = cryptoData.priceHistory || [];
    this.predictions = cryptoData.predictions || [];
    this.createdAt = cryptoData.createdAt || new Date();
    this.updatedAt = cryptoData.updatedAt || new Date();
  }

  // Virtual for price trend
  get trend() {
    if (this.priceChangePercentage24h > 0) return 'up';
    if (this.priceChangePercentage24h < 0) return 'down';
    return 'neutral';
  }

  // Instance method to save crypto
  async save() {
    try {
      const collection = getCollection('cryptos');
      this.updatedAt = new Date();
      this.lastUpdated = new Date();
      
      if (this._id && await Crypto.findById(this._id)) {
        // Update existing crypto
        const { _id, ...updateData } = this;
        await collection.updateOne(
          { _id: new ObjectId(this._id) },
          { $set: updateData }
        );
      } else {
        // Create new crypto
        const result = await collection.insertOne(this);
        this._id = result.insertedId;
      }
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Instance method to add price history
  async addPriceHistory(price, volume, timestamp = new Date()) {
    this.priceHistory.push({
      timestamp,
      price,
      volume
    });
    
    // Keep only last 1000 entries
    if (this.priceHistory.length > 1000) {
      this.priceHistory = this.priceHistory.slice(-1000);
    }
    
    return await this.save();
  }

  // Instance method to add prediction
  async addPrediction(predictedPrice, confidence, timeframe, model) {
    this.predictions.push({
      timestamp: new Date(),
      predictedPrice,
      confidence,
      timeframe,
      model
    });
    
    // Keep only last 100 predictions per timeframe
    const timeframePredictions = this.predictions.filter(p => p.timeframe === timeframe);
    if (timeframePredictions.length > 100) {
      const otherPredictions = this.predictions.filter(p => p.timeframe !== timeframe);
      const recentTimeframePredictions = timeframePredictions.slice(-100);
      this.predictions = [...otherPredictions, ...recentTimeframePredictions];
    }
    
    return await this.save();
  }

  // Static method to create crypto
  static async create(cryptoData) {
    try {
      const crypto = new Crypto(cryptoData);
      await crypto.save();
      return crypto;
    } catch (error) {
      throw error;
    }
  }

  // Static method to find crypto by ID
  static async findById(id) {
    try {
      const collection = getCollection('cryptos');
      const cryptoData = await collection.findOne({ _id: new ObjectId(id) });
      return cryptoData ? new Crypto(cryptoData) : null;
    } catch (error) {
      return null;
    }
  }

  // Static method to find one crypto
  static async findOne(query) {
    try {
      const collection = getCollection('cryptos');
      const cryptoData = await collection.findOne(query);
      return cryptoData ? new Crypto(cryptoData) : null;
    } catch (error) {
      return null;
    }
  }

  // Static method to find multiple cryptos
  static async find(query = {}, options = {}) {
    try {
      const collection = getCollection('cryptos');
      let cursor = collection.find(query);
      
      if (options.sort) {
        cursor = cursor.sort(options.sort);
      }
      
      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }
      
      const cryptoData = await cursor.toArray();
      return cryptoData.map(data => new Crypto(data));
    } catch (error) {
      return [];
    }
  }

  // Static method to find one and update
  static async findOneAndUpdate(query, update, options = {}) {
    try {
      const collection = getCollection('cryptos');
      
      if (options.upsert) {
        // Handle upsert manually
        const existing = await collection.findOne(query);
        if (existing) {
          await collection.updateOne(query, update);
          const updated = await collection.findOne(query);
          return new Crypto(updated);
        } else {
          // Create new document
          const newDoc = { ...query, ...update.$set };
          if (update.$push) {
            Object.keys(update.$push).forEach(key => {
              newDoc[key] = newDoc[key] || [];
              if (update.$push[key].$each) {
                newDoc[key].push(...update.$push[key].$each);
                if (update.$push[key].$slice) {
                  newDoc[key] = newDoc[key].slice(update.$push[key].$slice);
                }
              } else {
                newDoc[key].push(update.$push[key]);
              }
            });
          }
          const result = await collection.insertOne(newDoc);
          const created = await collection.findOne({ _id: result.insertedId });
          return new Crypto(created);
        }
      } else {
        await collection.updateOne(query, update);
        const updated = await collection.findOne(query);
        return updated ? new Crypto(updated) : null;
      }
    } catch (error) {
      throw error;
    }
  }

  // Static method to get trending cryptos
  static async getTrending(limit = 10) {
    return await Crypto.find({}, { 
      sort: { priceChangePercentage24h: -1 }, 
      limit 
    });
  }

  // Static method to get top by market cap
  static async getTopByMarketCap(limit = 10) {
    return await Crypto.find(
      { marketCap: { $ne: null } }, 
      { sort: { marketCap: -1 }, limit }
    );
  }

  // Static method to get price history for chart
  static async getPriceHistory(symbol, timeframe = '24h') {
    try {
      const timeframeMap = {
        '1h': 1 * 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      const timeLimit = new Date(Date.now() - timeframeMap[timeframe]);
      
      const crypto = await Crypto.findOne({ symbol });
      
      if (!crypto) return null;
      
      // Filter price history by timeframe
      const filteredHistory = crypto.priceHistory.filter(
        entry => new Date(entry.timestamp) >= timeLimit
      );
      
      return {
        ...crypto,
        priceHistory: filteredHistory
      };
    } catch (error) {
      return null;
    }
  }

  // Static method to count documents
  static async countDocuments(query = {}) {
    try {
      const collection = getCollection('cryptos');
      return await collection.countDocuments(query);
    } catch (error) {
      return 0;
    }
  }
}

export default Crypto;