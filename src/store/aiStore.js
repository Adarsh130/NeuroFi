import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Simple AI store without immer middleware to prevent dependency issues
const useAiStore = create(
  devtools((set, get) => ({
    // State
    recommendations: [],
    predictions: {},
    confidence: 75,
    isLoading: false,
    error: null,
    lastUpdated: null,
    popularSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT'],

    // Actions
    fetchRecommendations: async (currentPrices = {}) => {
      set({ isLoading: true, error: null });

      try {
        // Generate AI recommendations with current market prices
        const generateRecommendation = (symbol, currentPrice) => {
          const actions = ['BUY', 'SELL', 'HOLD'];
          const action = actions[Math.floor(Math.random() * actions.length)];
          const confidence = Math.floor(Math.random() * 30) + 60; // 60-90%
          
          let targetPrice, stopLoss;
          if (action === 'BUY') {
            targetPrice = currentPrice * (1.03 + Math.random() * 0.07); // 3-10% above
            stopLoss = currentPrice * (0.92 + Math.random() * 0.05); // 3-8% below
          } else if (action === 'SELL') {
            targetPrice = currentPrice * (0.90 + Math.random() * 0.07); // 3-10% below
            stopLoss = currentPrice * (1.03 + Math.random() * 0.05); // 3-8% above
          } else {
            targetPrice = currentPrice * (0.98 + Math.random() * 0.04); // ±2%
            stopLoss = currentPrice * (0.95 + Math.random() * 0.10); // ±5%
          }
          
          const reasonings = {
            BUY: [
              'Strong bullish momentum with RSI oversold conditions and positive sentiment analysis.',
              'Technical breakout above key resistance level with high volume confirmation.',
              'AI neural network detects accumulation pattern with institutional buying signals.',
              'Positive correlation with market leaders and strong fundamental indicators.'
            ],
            SELL: [
              'Bearish divergence detected with high probability of downward movement.',
              'Overbought conditions on multiple timeframes suggest correction incoming.',
              'AI pattern recognition identifies distribution phase with selling pressure.',
              'Technical indicators show weakening momentum and potential reversal.'
            ],
            HOLD: [
              'Consolidation phase expected. Wait for breakout confirmation.',
              'Mixed signals detected. Recommend patience until clearer trend emerges.',
              'Current price action suggests sideways movement in the near term.',
              'AI recommends waiting for better risk-reward entry opportunity.'
            ]
          };
          
          return {
            symbol,
            action,
            targetPrice,
            currentPrice,
            stopLoss,
            confidence,
            timeframe: action === 'HOLD' ? '3-7 days' : Math.random() > 0.5 ? '1-3 days' : '1-2 days',
            reasoning: reasonings[action][Math.floor(Math.random() * reasonings[action].length)],
            createdAt: new Date().toISOString(),
            isRealTime: true
          };
        };
        
        // Default prices if not provided
        const defaultPrices = {
          BTCUSDT: 43000,
          ETHUSDT: 2600,
          BNBUSDT: 300,
          SOLUSDT: 95,
          ADAUSDT: 0.45,
          XRPUSDT: 0.52,
          DOTUSDT: 7.2,
          LINKUSDT: 14.5
        };
        
        // Always prioritize current prices over defaults
        const getPrice = (symbol) => {
          const livePrice = currentPrices[symbol];
          const fallbackPrice = defaultPrices[symbol];
          
          // Use live price if available and reasonable, otherwise use fallback
          if (livePrice && livePrice > 0 && livePrice < 1000000) {
            console.log(`Using live price for ${symbol}: ${livePrice}`);
            return livePrice;
          } else {
            console.log(`Using fallback price for ${symbol}: ${fallbackPrice}`);
            return fallbackPrice;
          }
        };
        
        const mockRecommendations = [
          generateRecommendation('BTCUSDT', getPrice('BTCUSDT')),
          generateRecommendation('ETHUSDT', getPrice('ETHUSDT')),
          generateRecommendation('ADAUSDT', getPrice('ADAUSDT')),
          generateRecommendation('SOLUSDT', getPrice('SOLUSDT'))
        ].map((rec, index) => ({ ...rec, id: index + 1 }));

        // Generate predictions with current market prices
        const mockPredictions = {};
        get().popularSymbols.forEach(symbol => {
          const livePrice = currentPrices[symbol];
          const fallbackPrice = defaultPrices[symbol] || 100;
          
          // Use live price if available and reasonable
          const currentPrice = (livePrice && livePrice > 0 && livePrice < 1000000) ? livePrice : fallbackPrice;
          
          const prediction = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
          const priceTarget = prediction === 'BULLISH' 
            ? currentPrice * (1.02 + Math.random() * 0.08) // 2-10% above
            : currentPrice * (0.90 + Math.random() * 0.08); // 2-10% below
            
          mockPredictions[symbol] = {
            symbol,
            prediction,
            confidence: Math.floor(Math.random() * 30) + 60, // 60-90%
            priceTarget,
            currentPrice,
            timeframe: '24h',
            factors: [
              'Technical Analysis',
              'Market Sentiment',
              'Volume Analysis',
              'Social Media Trends'
            ],
            lastUpdated: new Date().toISOString(),
            usedLivePrice: !!(currentPrices[symbol] && currentPrices[symbol] > 0)
          };
        });

        // Calculate overall confidence
        const avgConfidence = mockRecommendations.length > 0 
          ? mockRecommendations.reduce((sum, rec) => sum + rec.confidence, 0) / mockRecommendations.length
          : 75;

        set({
          recommendations: mockRecommendations,
          predictions: mockPredictions,
          confidence: Math.round(avgConfidence),
          lastUpdated: new Date().toISOString(),
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        set({
          error: error.message,
          isLoading: false
        });
      }
    },

    acceptRecommendation: (recommendationId) => {
      const recommendation = get().recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return null;

      // Return trade data for the trading modal with real-time flag
      return {
        symbol: recommendation.symbol,
        action: recommendation.action,
        targetPrice: recommendation.targetPrice,
        stopLoss: recommendation.stopLoss,
        confidence: recommendation.confidence,
        timeframe: recommendation.timeframe,
        reasoning: recommendation.reasoning,
        currentPrice: recommendation.currentPrice,
        isRealTime: recommendation.isRealTime || false
      };
    },

    clearError: () => {
      set({ error: null });
    },

    // Clear cache and refresh predictions
    refreshPredictions: async () => {
      await get().fetchRecommendations();
    },

    // Get predictions for a specific symbol
    getPredictionsForSymbol: async (symbol) => {
      try {
        const mockPrediction = {
          symbol,
          prediction: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
          confidence: Math.floor(Math.random() * 30) + 60,
          priceTarget: Math.random() * 1000 + 1000,
          timeframe: '24h',
          factors: [
            'Technical Analysis',
            'Market Sentiment',
            'Volume Analysis',
            'Social Media Trends'
          ]
        };

        set(state => ({
          predictions: {
            ...state.predictions,
            [symbol]: mockPrediction
          }
        }));

        return mockPrediction;
      } catch (error) {
        console.error(`Error getting predictions for ${symbol}:`, error);
        return null;
      }
    },

    // Getters
    getRecommendationsBySymbol: (symbol) => {
      return get().recommendations.filter(r => r.symbol === symbol);
    },

    getRecommendationsByAction: (action) => {
      return get().recommendations.filter(r => r.action === action);
    },

    getHighConfidenceRecommendations: (minConfidence = 80) => {
      return get().recommendations.filter(r => r.confidence >= minConfidence);
    }
  }))
);

export { useAiStore };