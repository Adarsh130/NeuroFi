import { create } from 'zustand';
import binanceService from '../services/binanceService';

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

  // Fetch market data with real-time prices
  fetchMarketData: async (currentPrices = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Try to get real market data from binance service
      const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'BNBUSDT'];
      
      let marketData = [];
      
      try {
        // Attempt to get real data from binance service
        marketData = await binanceService.getMultipleMarketData(symbols);
        
        // Format the data for display
        marketData = marketData.map(crypto => ({
          symbol: crypto.symbol,
          price: typeof crypto.price === 'number' ? crypto.price.toFixed(crypto.price >= 1 ? 2 : 6) : crypto.price,
          change: crypto.priceChange ? (crypto.priceChange >= 0 ? `+${crypto.priceChange.toFixed(2)}` : crypto.priceChange.toFixed(2)) : '0.00',
          changePercent: crypto.priceChangePercent ? (crypto.priceChangePercent >= 0 ? `+${crypto.priceChangePercent.toFixed(2)}%` : `${crypto.priceChangePercent.toFixed(2)}%`) : '0.00%',
          volume: crypto.volume ? crypto.volume.toLocaleString() : '0',
          high: crypto.highPrice ? crypto.highPrice.toFixed(crypto.highPrice >= 1 ? 2 : 6) : '0',
          low: crypto.lowPrice ? crypto.lowPrice.toFixed(crypto.lowPrice >= 1 ? 2 : 6) : '0'
        }));
      } catch (apiError) {
        console.warn('API failed, using current prices with mock data:', apiError.message);
        
        // Fallback to current prices with generated data
        const fallbackPrices = {
          BTCUSDT: 43000,
          ETHUSDT: 2600,
          ADAUSDT: 0.45,
          SOLUSDT: 95,
          BNBUSDT: 300
        };
        
        marketData = symbols.map(symbol => {
          const currentPrice = currentPrices[symbol] || fallbackPrices[symbol] || 100;
          const change = (Math.random() - 0.5) * currentPrice * 0.05; // ±2.5% change
          const changePercent = (change / currentPrice) * 100;
          
          return {
            symbol,
            price: currentPrice.toFixed(currentPrice >= 1 ? 2 : 6),
            change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
            changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
            volume: (Math.random() * 1000000000).toLocaleString(),
            high: (currentPrice * 1.05).toFixed(currentPrice >= 1 ? 2 : 6),
            low: (currentPrice * 0.95).toFixed(currentPrice >= 1 ? 2 : 6)
          };
        });
      }
      
      set({ marketData, isLoading: false });
    } catch (error) {
      console.error('Market data fetch failed:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Get crypto by symbol
  getCryptoBySymbol: (symbol) => {
    const { marketData } = get();
    return marketData.find(crypto => crypto.symbol === symbol);
  },
  
  // Update market data with current prices
  updateWithCurrentPrices: (currentPrices) => {
    const { fetchMarketData } = get();
    fetchMarketData(currentPrices);
  }
}));