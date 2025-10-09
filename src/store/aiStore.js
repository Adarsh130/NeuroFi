import { create } from 'zustand';

export const useAiStore = create((set, get) => ({
  // AI recommendations
  recommendations: [],
  predictions: {},
  confidence: 0,
  isLoading: false,
  error: null,

  // Actions
  setRecommendations: (recommendations) => set({ recommendations }),
  setPredictions: (predictions) => set({ predictions }),
  setConfidence: (confidence) => set({ confidence }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Fetch AI recommendations
  fetchRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data - replace with actual AI backend call
      const mockRecommendations = [
        {
          id: '1',
          symbol: 'BTCUSDT',
          action: 'BUY',
          confidence: 85,
          targetPrice: '45000',
          stopLoss: '41000',
          reasoning: 'Strong bullish momentum with high volume support. Technical indicators suggest continued upward movement.',
          timeframe: '1-3 days',
          riskLevel: 'Medium'
        },
        {
          id: '2',
          symbol: 'ETHUSDT',
          action: 'HOLD',
          confidence: 72,
          targetPrice: '2800',
          stopLoss: '2500',
          reasoning: 'Consolidation phase expected. Wait for clear breakout above resistance.',
          timeframe: '3-7 days',
          riskLevel: 'Low'
        },
        {
          id: '3',
          symbol: 'ADAUSDT',
          action: 'SELL',
          confidence: 68,
          targetPrice: '0.42',
          stopLoss: '0.47',
          reasoning: 'Bearish divergence detected. Potential downside movement expected.',
          timeframe: '1-2 days',
          riskLevel: 'High'
        }
      ];

      const mockPredictions = {
        'BTCUSDT': {
          '1h': { price: 43500, direction: 'up', probability: 0.75 },
          '4h': { price: 44200, direction: 'up', probability: 0.68 },
          '1d': { price: 45000, direction: 'up', probability: 0.62 }
        },
        'ETHUSDT': {
          '1h': { price: 2670, direction: 'up', probability: 0.55 },
          '4h': { price: 2700, direction: 'up', probability: 0.58 },
          '1d': { price: 2750, direction: 'up', probability: 0.52 }
        }
      };
      
      set({ 
        recommendations: mockRecommendations,
        predictions: mockPredictions,
        confidence: 75,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Get recommendation by symbol
  getRecommendationBySymbol: (symbol) => {
    const { recommendations } = get();
    return recommendations.find(rec => rec.symbol === symbol);
  }
}));