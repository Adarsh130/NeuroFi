import { create } from 'zustand';

export const useSentimentStore = create((set, get) => ({
  // Sentiment data
  sentimentData: {
    overall: 0,
    positive: 0,
    neutral: 0,
    negative: 0
  },
  trendingTopics: [],
  sentimentHistory: [],
  isLoading: false,
  error: null,

  // Actions
  setSentimentData: (data) => set({ sentimentData: data }),
  setTrendingTopics: (topics) => set({ trendingTopics: topics }),
  setSentimentHistory: (history) => set({ sentimentHistory: history }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Fetch sentiment data
  fetchSentimentData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data - replace with actual Twitter API call
      const mockSentiment = {
        overall: 72,
        positive: 45,
        neutral: 35,
        negative: 20
      };

      const mockTopics = [
        { topic: '#Bitcoin', sentiment: 78, mentions: 15420 },
        { topic: '#Ethereum', sentiment: 65, mentions: 8930 },
        { topic: '#Crypto', sentiment: 71, mentions: 12340 },
        { topic: '#DeFi', sentiment: 68, mentions: 5670 },
        { topic: '#NFT', sentiment: 52, mentions: 3450 }
      ];

      const mockHistory = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        sentiment: Math.floor(Math.random() * 40) + 50,
        volume: Math.floor(Math.random() * 10000) + 5000
      }));
      
      set({ 
        sentimentData: mockSentiment,
        trendingTopics: mockTopics,
        sentimentHistory: mockHistory,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));