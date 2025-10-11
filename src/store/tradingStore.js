import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

export const useTradingStore = create(
  persist(
    (set, get) => ({
      // Trading state
      activeTrades: [],
      tradeHistory: [],
      isTrading: false,
      selectedSymbol: 'BTCUSDT',
      selectedTimeframe: '1h',
      
      // Demo wallet
      demoBalance: {
        USDT: 10000, // Starting demo balance
        BTC: 0,
        ETH: 0,
        BNB: 0,
        SOL: 0,
        ADA: 0,
        DOT: 0,
        LINK: 0,
        XRP: 0
      },
      
      // Portfolio
      portfolio: {
        totalValue: 10000,
        totalPnL: 0,
        totalPnLPercent: 0,
        holdings: []
      },

      // Actions
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
      
      // Open a new trade
      openTrade: async (tradeData) => {
        const { activeTrades, demoBalance } = get();
        const {
          symbol,
          action, // 'BUY' or 'SELL'
          amount, // Amount in USDT
          currentPrice,
          targetPrice,
          stopLoss,
          timeframe,
          leverage = 1
        } = tradeData;

        // Check if user has enough balance
        const requiredBalance = amount / leverage;
        if (demoBalance.USDT < requiredBalance) {
          throw new Error('Insufficient balance');
        }

        const newTrade = {
          id: Date.now().toString(),
          symbol,
          action,
          amount,
          currentPrice,
          entryPrice: currentPrice,
          targetPrice,
          stopLoss,
          timeframe,
          leverage,
          quantity: amount / currentPrice,
          status: 'OPEN',
          openTime: new Date().toISOString(),
          pnl: 0,
          pnlPercent: 0
        };

        // Update balance
        const newBalance = {
          ...demoBalance,
          USDT: demoBalance.USDT - requiredBalance
        };

        set({
          activeTrades: [...activeTrades, newTrade],
          demoBalance: newBalance
        });

        // Save to MongoDB if user is authenticated
        try {
          if (authService.isAuthenticated()) {
            const user = authService.getUser();
            await authService.updatePreferences({
              ...user.preferences,
              tradingData: {
                activeTrades: [...activeTrades, newTrade],
                demoBalance: newBalance,
                lastTradeTime: new Date().toISOString()
              }
            });
          }
        } catch (error) {
          console.error('Error saving trade to MongoDB:', error);
        }

        return newTrade;
      },

      // Close a trade
      closeTrade: async (tradeId, currentPrice) => {
        const { activeTrades, tradeHistory } = get();
        const trade = activeTrades.find(t => t.id === tradeId);
        
        if (!trade) return null;

        // Calculate PnL
        const priceDiff = trade.action === 'BUY' 
          ? currentPrice - trade.entryPrice
          : trade.entryPrice - currentPrice;
        
        const pnl = (priceDiff / trade.entryPrice) * trade.amount * trade.leverage;
        const pnlPercent = (pnl / trade.amount) * 100;

        const closedTrade = {
          ...trade,
          status: 'CLOSED',
          closeTime: new Date().toISOString(),
          closePrice: currentPrice,
          pnl,
          pnlPercent
        };

        const updatedActiveTrades = activeTrades.filter(t => t.id !== tradeId);
        const updatedTradeHistory = [closedTrade, ...tradeHistory];

        set({
          activeTrades: updatedActiveTrades,
          tradeHistory: updatedTradeHistory
        });

        // Save to MongoDB if user is authenticated
        try {
          if (authService.isAuthenticated()) {
            const user = authService.getUser();
            await authService.updatePreferences({
              ...user.preferences,
              tradingData: {
                activeTrades: updatedActiveTrades,
                tradeHistory: updatedTradeHistory,
                lastTradeCloseTime: new Date().toISOString()
              }
            });
          }
        } catch (error) {
          console.error('Error saving trade closure to MongoDB:', error);
        }

        return closedTrade;
      },

      // Update trade PnL based on current price
      updateTradePnL: (currentPrices) => {
        const { activeTrades } = get();
        
        const updatedTrades = activeTrades.map(trade => {
          const currentPrice = currentPrices[trade.symbol];
          if (!currentPrice) return trade;

          const priceDiff = trade.action === 'BUY' 
            ? currentPrice - trade.entryPrice
            : trade.entryPrice - currentPrice;
          
          const pnl = (priceDiff / trade.entryPrice) * trade.amount * trade.leverage;
          const pnlPercent = (pnl / trade.amount) * 100;

          return {
            ...trade,
            currentPrice,
            pnl,
            pnlPercent
          };
        });

        set({ activeTrades: updatedTrades });
      },

      // Add demo funds
      addDemoFunds: (amount) => {
        const { demoBalance } = get();
        set({
          demoBalance: {
            ...demoBalance,
            USDT: demoBalance.USDT + amount
          }
        });
      },

      // Reset demo account
      resetDemoAccount: () => {
        set({
          activeTrades: [],
          tradeHistory: [],
          demoBalance: {
            USDT: 10000,
            BTC: 0,
            ETH: 0,
            BNB: 0,
            SOL: 0,
            ADA: 0,
            DOT: 0,
            LINK: 0,
            XRP: 0
          },
          portfolio: {
            totalValue: 10000,
            totalPnL: 0,
            totalPnLPercent: 0,
            holdings: []
          }
        });
      },

      // Update portfolio
      updatePortfolio: (currentPrices) => {
        const { demoBalance, activeTrades } = get();
        
        let totalValue = demoBalance.USDT;
        let totalPnL = 0;
        
        // Add value from active trades
        activeTrades.forEach(trade => {
          totalValue += trade.amount + (trade.pnl || 0);
          totalPnL += trade.pnl || 0;
        });

        // Add value from crypto holdings
        Object.entries(demoBalance).forEach(([symbol, amount]) => {
          if (symbol !== 'USDT' && amount > 0) {
            const price = currentPrices[`${symbol}USDT`] || 0;
            totalValue += amount * price;
          }
        });

        const totalPnLPercent = ((totalValue - 10000) / 10000) * 100;

        set({
          portfolio: {
            totalValue,
            totalPnL: totalValue - 10000,
            totalPnLPercent,
            holdings: Object.entries(demoBalance)
              .filter(([symbol, amount]) => amount > 0)
              .map(([symbol, amount]) => ({
                symbol,
                amount,
                value: symbol === 'USDT' ? amount : amount * (currentPrices[`${symbol}USDT`] || 0)
              }))
          }
        });
      },

      // Get trade statistics
      getTradeStats: () => {
        const { tradeHistory } = get();
        
        if (tradeHistory.length === 0) {
          return {
            totalTrades: 0,
            winRate: 0,
            avgPnL: 0,
            bestTrade: 0,
            worstTrade: 0
          };
        }

        const winningTrades = tradeHistory.filter(t => t.pnl > 0);
        const totalPnL = tradeHistory.reduce((sum, t) => sum + t.pnl, 0);
        const bestTrade = Math.max(...tradeHistory.map(t => t.pnl));
        const worstTrade = Math.min(...tradeHistory.map(t => t.pnl));

        return {
          totalTrades: tradeHistory.length,
          winRate: (winningTrades.length / tradeHistory.length) * 100,
          avgPnL: totalPnL / tradeHistory.length,
          bestTrade,
          worstTrade
        };
      }
    }),
    {
      name: 'neurofi-trading-store',
      partialize: (state) => ({
        activeTrades: state.activeTrades,
        tradeHistory: state.tradeHistory,
        demoBalance: state.demoBalance,
        portfolio: state.portfolio
      })
    }
  )
);