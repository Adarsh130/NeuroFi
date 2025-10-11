import axios from 'axios';

// This would be your sentiment analysis backend URL in production
const SENTIMENT_BASE_URL = process.env.REACT_APP_SENTIMENT_API_URL || 'http://localhost:5001/api';

class SentimentService {
  constructor() {
    this.api = axios.create({
      baseURL: SENTIMENT_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('neurofi-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get overall market sentiment
   * @param {Object} params - Query parameters
   * @param {string} params.timeframe - Time range (1h, 4h, 24h, 7d, 30d)
   * @param {Array<string>} params.keywords - Keywords to analyze
   * @returns {Promise<Object>} Sentiment data
   */
  async getMarketSentiment(params = {}) {
    try {
      const response = await this.api.get('/sentiment', {
        params: {
          timeframe: params.timeframe || '24h',
          keywords: params.keywords || ['bitcoin', 'ethereum', 'crypto'],
          sources: params.sources || ['twitter', 'reddit', 'news'],
          ...params
        }
      });
      
      return response.data.sentiment || {};
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      
      // Return mock data for development
      return this.getMockSentiment();
    }
  }

  /**
   * Get trending topics and hashtags
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Trending topics
   */
  async getTrendingTopics(params = {}) {
    try {
      const response = await this.api.get('/trending', {
        params: {
          limit: params.limit || 10,
          timeframe: params.timeframe || '24h',
          category: params.category || 'crypto',
          ...params
        }
      });
      
      return response.data.topics || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      
      // Return mock data for development
      return this.getMockTrendingTopics();
    }
  }

  /**
   * Get sentiment analysis for specific cryptocurrencies
   * @param {Array<string>} symbols - Cryptocurrency symbols
   * @param {string} timeframe - Time range
   * @returns {Promise<Object>} Symbol-specific sentiment
   */
  async getCryptoSentiment(symbols, timeframe = '24h') {
    try {
      const response = await this.api.post('/crypto-sentiment', {
        symbols,
        timeframe,
        includeMetrics: true
      });
      
      return response.data.sentiment || {};
    } catch (error) {
      console.error('Error fetching crypto sentiment:', error);
      
      // Return mock data for development
      return this.getMockCryptoSentiment(symbols);
    }
  }

  /**
   * Get sentiment history over time
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Historical sentiment data
   */
  async getSentimentHistory(params = {}) {
    try {
      const response = await this.api.get('/sentiment/history', {
        params: {
          timeframe: params.timeframe || '7d',
          interval: params.interval || '1h',
          symbol: params.symbol || 'BTC',
          ...params
        }
      });
      
      return response.data.history || [];
    } catch (error) {
      console.error('Error fetching sentiment history:', error);
      
      // Return mock data for development
      return this.getMockSentimentHistory();
    }
  }

  /**
   * Get news sentiment analysis
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} News sentiment data
   */
  async getNewsSentiment(params = {}) {
    try {
      const response = await this.api.get('/news-sentiment', {
        params: {
          limit: params.limit || 20,
          timeframe: params.timeframe || '24h',
          sources: params.sources || ['coindesk', 'cointelegraph', 'decrypt'],
          ...params
        }
      });
      
      return response.data.news || [];
    } catch (error) {
      console.error('Error fetching news sentiment:', error);
      
      // Return mock data for development
      return this.getMockNewsSentiment();
    }
  }

  /**
   * Get social media mentions and engagement
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Social media data
   */
  async getSocialMetrics(params = {}) {
    try {
      const response = await this.api.get('/social-metrics', {
        params: {
          timeframe: params.timeframe || '24h',
          platforms: params.platforms || ['twitter', 'reddit'],
          keywords: params.keywords || ['bitcoin', 'crypto'],
          ...params
        }
      });
      
      return response.data.metrics || {};
    } catch (error) {
      console.error('Error fetching social metrics:', error);
      
      // Return mock data for development
      return this.getMockSocialMetrics();
    }
  }

  /**
   * Get fear and greed index
   * @returns {Promise<Object>} Fear and greed data
   */
  async getFearGreedIndex() {
    try {
      const response = await this.api.get('/fear-greed');
      return response.data.index || {};
    } catch (error) {
      console.error('Error fetching fear and greed index:', error);
      
      // Return mock data for development
      return {
        value: 65,
        classification: 'Greed',
        timestamp: new Date().toISOString(),
        previousValue: 62,
        change: 3
      };
    }
  }

  // Mock data methods for development
  getMockSentiment() {
    return {
      overall: 72,
      positive: 45,
      neutral: 35,
      negative: 20,
      confidence: 0.85,
      volume: 125420,
      change24h: 5.2,
      sources: {
        twitter: { sentiment: 74, volume: 85320 },
        reddit: { sentiment: 68, volume: 25100 },
        news: { sentiment: 75, volume: 15000 }
      }
    };
  }

  getMockTrendingTopics() {
    return [
      {
        topic: '#Bitcoin',
        sentiment: 78,
        mentions: 15420,
        change24h: 12.5,
        category: 'cryptocurrency'
      },
      {
        topic: '#Ethereum',
        sentiment: 65,
        mentions: 8930,
        change24h: -3.2,
        category: 'cryptocurrency'
      },
      {
        topic: '#Crypto',
        sentiment: 71,
        mentions: 12340,
        change24h: 8.7,
        category: 'general'
      },
      {
        topic: '#DeFi',
        sentiment: 68,
        mentions: 5670,
        change24h: 15.3,
        category: 'technology'
      },
      {
        topic: '#NFT',
        sentiment: 52,
        mentions: 3450,
        change24h: -8.9,
        category: 'technology'
      }
    ];
  }

  getMockCryptoSentiment(symbols) {
    const sentiment = {};
    
    symbols.forEach(symbol => {
      const baseSentiment = 50 + Math.random() * 40;
      sentiment[symbol] = {
        sentiment: Math.round(baseSentiment),
        mentions: Math.floor(Math.random() * 10000) + 1000,
        change24h: (Math.random() - 0.5) * 20,
        sources: {
          twitter: Math.round(baseSentiment + (Math.random() - 0.5) * 10),
          reddit: Math.round(baseSentiment + (Math.random() - 0.5) * 10),
          news: Math.round(baseSentiment + (Math.random() - 0.5) * 10)
        }
      };
    });
    
    return sentiment;
  }

  getMockSentimentHistory() {
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      sentiment: Math.floor(Math.random() * 40) + 50,
      volume: Math.floor(Math.random() * 10000) + 5000,
      positive: Math.floor(Math.random() * 30) + 30,
      neutral: Math.floor(Math.random() * 20) + 30,
      negative: Math.floor(Math.random() * 30) + 10
    }));
  }

  getMockNewsSentiment() {
    const headlines = [
      'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
      'Ethereum 2.0 Upgrade Shows Promising Results',
      'Regulatory Clarity Boosts Cryptocurrency Market Confidence',
      'Major Bank Announces Cryptocurrency Trading Services',
      'DeFi Protocol Launches Revolutionary Yield Farming Feature'
    ];
    
    return headlines.map((headline, index) => ({
      id: index + 1,
      headline,
      sentiment: Math.floor(Math.random() * 40) + 50,
      source: ['CoinDesk', 'Cointelegraph', 'Decrypt', 'CoinGecko'][Math.floor(Math.random() * 4)],
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      url: `https://example.com/news/${index + 1}`,
      impact: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    }));
  }

  getMockSocialMetrics() {
    return {
      totalMentions: 125420,
      uniqueUsers: 45230,
      engagement: 892340,
      reach: 2340000,
      platforms: {
        twitter: {
          mentions: 85320,
          users: 32100,
          engagement: 654200,
          topTweets: [
            { text: 'Bitcoin is the future of money! 🚀', sentiment: 85, retweets: 1250 },
            { text: 'Ethereum gas fees are getting better', sentiment: 72, retweets: 890 }
          ]
        },
        reddit: {
          mentions: 25100,
          users: 8900,
          engagement: 156780,
          topPosts: [
            { title: 'Why I\'m bullish on crypto long-term', sentiment: 78, upvotes: 2340 },
            { title: 'Market analysis: What to expect next week', sentiment: 65, upvotes: 1890 }
          ]
        }
      },
      influencers: [
        { name: 'CryptoExpert', followers: 125000, sentiment: 82 },
        { name: 'BlockchainGuru', followers: 89000, sentiment: 76 }
      ]
    };
  }
}

// Create and export a singleton instance
const sentimentService = new SentimentService();
export default sentimentService;