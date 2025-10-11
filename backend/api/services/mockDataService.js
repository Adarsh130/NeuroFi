/**
 * Mock data service for when MongoDB is not available
 * Provides sample data for development and testing
 */

// Mock cryptocurrency data
const mockCryptos = [
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    currentPrice: 43250.50,
    priceChange24h: 1250.30,
    priceChangePercentage24h: 2.98,
    high24h: 44100.00,
    low24h: 41800.00,
    volume24h: 28450000000,
    marketCap: 847500000000,
    lastUpdated: new Date()
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    currentPrice: 2650.75,
    priceChange24h: 85.25,
    priceChangePercentage24h: 3.32,
    high24h: 2720.00,
    low24h: 2580.00,
    volume24h: 15200000000,
    marketCap: 318600000000,
    lastUpdated: new Date()
  },
  {
    symbol: 'BNBUSDT',
    name: 'Binance Coin',
    currentPrice: 315.80,
    priceChange24h: 12.45,
    priceChangePercentage24h: 4.10,
    high24h: 325.00,
    low24h: 305.00,
    volume24h: 1850000000,
    marketCap: 47370000000,
    lastUpdated: new Date()
  },
  {
    symbol: 'SOLUSDT',
    name: 'Solana',
    currentPrice: 98.45,
    priceChange24h: 5.67,
    priceChangePercentage24h: 6.11,
    high24h: 102.00,
    low24h: 94.50,
    volume24h: 2100000000,
    marketCap: 42800000000,
    lastUpdated: new Date()
  },
  {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    currentPrice: 0.485,
    priceChange24h: 0.025,
    priceChangePercentage24h: 5.43,
    high24h: 0.495,
    low24h: 0.465,
    volume24h: 580000000,
    marketCap: 17200000000,
    lastUpdated: new Date()
  }
];

// Mock user data
const mockUsers = new Map();

// Mock predictions
const mockPredictions = [
  {
    symbol: 'BTCUSDT',
    predictedPrice: 45200.00,
    confidence: 78.5,
    timeframe: '24h',
    model: 'ensemble',
    timestamp: new Date()
  },
  {
    symbol: 'ETHUSDT',
    predictedPrice: 2750.00,
    confidence: 82.3,
    timeframe: '24h',
    model: 'ensemble',
    timestamp: new Date()
  }
];

class MockDataService {
  constructor() {
    this.cryptos = new Map(mockCryptos.map(crypto => [crypto.symbol, crypto]));
    this.users = mockUsers;
    this.predictions = mockPredictions;
  }

  // Crypto methods
  async getAllCryptos() {
    return Array.from(this.cryptos.values());
  }

  async getCrypto(symbol) {
    return this.cryptos.get(symbol) || null;
  }

  async updateCrypto(symbol, data) {
    if (this.cryptos.has(symbol)) {
      this.cryptos.set(symbol, { ...this.cryptos.get(symbol), ...data });
      return this.cryptos.get(symbol);
    }
    return null;
  }

  // User methods
  async createUser(userData) {
    const userId = Date.now().toString();
    const user = {
      _id: userId,
      ...userData,
      wallet: {
        balance: 10000,
        holdings: [],
        transactions: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(userId, user);
    return user;
  }

  async findUser(query) {
    for (const user of this.users.values()) {
      if (query.email && user.email === query.email) return user;
      if (query._id && user._id === query._id) return user;
      if (query.username && user.username === query.username) return user;
    }
    return null;
  }

  async updateUser(userId, data) {
    if (this.users.has(userId)) {
      this.users.set(userId, { ...this.users.get(userId), ...data, updatedAt: new Date() });
      return this.users.get(userId);
    }
    return null;
  }

  // Prediction methods
  async getPredictions(symbol = null) {
    if (symbol) {
      return this.predictions.filter(p => p.symbol === symbol);
    }
    return this.predictions;
  }

  async addPrediction(prediction) {
    this.predictions.push({
      ...prediction,
      timestamp: new Date()
    });
    return prediction;
  }

  // Market data methods
  async getMarketOverview() {
    const cryptos = Array.from(this.cryptos.values());
    return {
      totalMarketCap: cryptos.reduce((sum, crypto) => sum + (crypto.marketCap || 0), 0),
      total24hVolume: cryptos.reduce((sum, crypto) => sum + (crypto.volume24h || 0), 0),
      btcDominance: 42.5,
      totalCryptos: cryptos.length,
      topGainers: cryptos
        .sort((a, b) => b.priceChangePercentage24h - a.priceChangePercentage24h)
        .slice(0, 3),
      topLosers: cryptos
        .sort((a, b) => a.priceChangePercentage24h - b.priceChangePercentage24h)
        .slice(0, 3)
    };
  }

  // Utility methods
  isConnected() {
    return false; // Always return false since this is mock data
  }

  async healthCheck() {
    return {
      status: 'mock',
      message: 'Using mock data - MongoDB not connected',
      timestamp: new Date()
    };
  }
}

export default new MockDataService();