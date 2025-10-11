import { create } from 'zustand';

export const useMarketStore = create((set, get) => ({
  // Market data
  marketData: [],
  selectedCrypto: 'BTCUSDT',
  priceData: {},
  isLoading: false,
  error: null,

  // Actions
  setMarketData: (data) => set({ marketData: data }),
  setSelectedCrypto: (crypto) => set({ selectedCrypto: crypto }),
  setPriceData: (data) => set({ priceData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Fetch market data
  fetchMarketData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data - replace with actual Binance API call
      const mockData = [
        {
          symbol: 'BTCUSDT',
          price: '43250.50',
          change: '+2.45',
          changePercent: '+5.67',
          volume: '1,234,567,890',
          high: '44000.00',
          low: '42000.00'
        },
        {
          symbol: 'ETHUSDT',
          price: '2650.75',
          change: '+45.25',
          changePercent: '+1.73',
          volume: '987,654,321',
          high: '2700.00',
          low: '2600.00'
        },
        {
          symbol: 'ADAUSDT',
          price: '0.4523',
          change: '-0.0123',
          changePercent: '-2.65',
          volume: '456,789,123',
          high: '0.4650',
          low: '0.4400'
        }
      ];
      
      set({ marketData: mockData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Get crypto by symbol
  getCryptoBySymbol: (symbol) => {
    const { marketData } = get();
    return marketData.find(crypto => crypto.symbol === symbol);
  }
}));