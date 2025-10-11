import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWalletStore = create(
  persist(
    (set, get) => ({
      // Wallet state
      wallets: [
        {
          id: 'demo-wallet',
          name: 'Demo Wallet',
          type: 'demo',
          isActive: true,
          balances: {
            USDT: 10000,
            BTC: 0,
            ETH: 0,
            BNB: 0,
            SOL: 0,
            ADA: 0,
            DOT: 0,
            LINK: 0,
            XRP: 0
          }
        }
      ],
      activeWalletId: 'demo-wallet',
      transactions: [],
      isLoading: false,
      error: null,

      // Actions
      setActiveWallet: (walletId) => set({ activeWalletId: walletId }),
      
      // Get active wallet
      getActiveWallet: () => {
        const { wallets, activeWalletId } = get();
        return wallets.find(w => w.id === activeWalletId);
      },

      // Add new wallet
      addWallet: (walletData) => {
        const { wallets } = get();
        const newWallet = {
          id: Date.now().toString(),
          name: walletData.name,
          type: walletData.type || 'demo',
          isActive: false,
          balances: {
            USDT: 0,
            BTC: 0,
            ETH: 0,
            BNB: 0,
            SOL: 0,
            ADA: 0,
            DOT: 0,
            LINK: 0,
            XRP: 0,
            ...walletData.balances
          }
        };

        set({ wallets: [...wallets, newWallet] });
        return newWallet;
      },

      // Update wallet balance
      updateWalletBalance: (walletId, symbol, amount, operation = 'set') => {
        const { wallets } = get();
        
        const updatedWallets = wallets.map(wallet => {
          if (wallet.id === walletId) {
            const currentBalance = wallet.balances[symbol] || 0;
            const newBalance = operation === 'add' 
              ? currentBalance + amount
              : operation === 'subtract'
              ? Math.max(0, currentBalance - amount)
              : amount;

            return {
              ...wallet,
              balances: {
                ...wallet.balances,
                [symbol]: newBalance
              }
            };
          }
          return wallet;
        });

        set({ wallets: updatedWallets });
      },

      // Transfer between wallets
      transferBetweenWallets: (fromWalletId, toWalletId, symbol, amount) => {
        const { wallets } = get();
        
        const fromWallet = wallets.find(w => w.id === fromWalletId);
        const toWallet = wallets.find(w => w.id === toWalletId);

        if (!fromWallet || !toWallet) {
          throw new Error('Wallet not found');
        }

        const fromBalance = fromWallet.balances[symbol] || 0;
        if (fromBalance < amount) {
          throw new Error('Insufficient balance');
        }

        // Update balances
        get().updateWalletBalance(fromWalletId, symbol, amount, 'subtract');
        get().updateWalletBalance(toWalletId, symbol, amount, 'add');

        // Add transaction record
        const transaction = {
          id: Date.now().toString(),
          type: 'transfer',
          fromWallet: fromWalletId,
          toWallet: toWalletId,
          symbol,
          amount,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        const { transactions } = get();
        set({ transactions: [transaction, ...transactions] });

        return transaction;
      },

      // Add demo funds to active wallet
      addDemoFunds: (amount, symbol = 'USDT') => {
        const { activeWalletId } = get();
        get().updateWalletBalance(activeWalletId, symbol, amount, 'add');

        // Add transaction record
        const transaction = {
          id: Date.now().toString(),
          type: 'deposit',
          wallet: activeWalletId,
          symbol,
          amount,
          timestamp: new Date().toISOString(),
          status: 'completed',
          description: 'Demo funds added'
        };

        const { transactions } = get();
        set({ transactions: [transaction, ...transactions] });

        return transaction;
      },

      // Simulate crypto purchase
      buyCrypto: (symbol, amountUSDT, currentPrice) => {
        const { activeWalletId } = get();
        const activeWallet = get().getActiveWallet();

        if (!activeWallet) {
          throw new Error('No active wallet');
        }

        const usdtBalance = activeWallet.balances.USDT || 0;
        if (usdtBalance < amountUSDT) {
          throw new Error('Insufficient USDT balance');
        }

        const cryptoAmount = amountUSDT / currentPrice;

        // Update balances
        get().updateWalletBalance(activeWalletId, 'USDT', amountUSDT, 'subtract');
        get().updateWalletBalance(activeWalletId, symbol, cryptoAmount, 'add');

        // Add transaction record
        const transaction = {
          id: Date.now().toString(),
          type: 'buy',
          wallet: activeWalletId,
          symbol,
          amount: cryptoAmount,
          price: currentPrice,
          total: amountUSDT,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        const { transactions } = get();
        set({ transactions: [transaction, ...transactions] });

        return transaction;
      },

      // Simulate crypto sale
      sellCrypto: (symbol, amount, currentPrice) => {
        const { activeWalletId } = get();
        const activeWallet = get().getActiveWallet();

        if (!activeWallet) {
          throw new Error('No active wallet');
        }

        const cryptoBalance = activeWallet.balances[symbol] || 0;
        if (cryptoBalance < amount) {
          throw new Error(`Insufficient ${symbol} balance`);
        }

        const usdtAmount = amount * currentPrice;

        // Update balances
        get().updateWalletBalance(activeWalletId, symbol, amount, 'subtract');
        get().updateWalletBalance(activeWalletId, 'USDT', usdtAmount, 'add');

        // Add transaction record
        const transaction = {
          id: Date.now().toString(),
          type: 'sell',
          wallet: activeWalletId,
          symbol,
          amount,
          price: currentPrice,
          total: usdtAmount,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        const { transactions } = get();
        set({ transactions: [transaction, ...transactions] });

        return transaction;
      },

      // Simulate crypto swap
      swapCrypto: (fromSymbol, toSymbol, fromAmount, toAmount, fromPrice, toPrice) => {
        const { activeWalletId } = get();
        const activeWallet = get().getActiveWallet();

        if (!activeWallet) {
          throw new Error('No active wallet');
        }

        const fromBalance = activeWallet.balances[fromSymbol] || 0;
        if (fromBalance < fromAmount) {
          throw new Error(`Insufficient ${fromSymbol} balance`);
        }

        // Update balances
        get().updateWalletBalance(activeWalletId, fromSymbol, fromAmount, 'subtract');
        get().updateWalletBalance(activeWalletId, toSymbol, toAmount, 'add');

        // Add transaction record
        const transaction = {
          id: Date.now().toString(),
          type: 'swap',
          wallet: activeWalletId,
          fromSymbol,
          toSymbol,
          fromAmount,
          toAmount,
          fromPrice,
          toPrice,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        const { transactions } = get();
        set({ transactions: [transaction, ...transactions] });

        return transaction;
      },

      // Get wallet portfolio value
      getWalletValue: (walletId, currentPrices) => {
        const { wallets } = get();
        const wallet = wallets.find(w => w.id === walletId);
        
        if (!wallet) return 0;

        let totalValue = wallet.balances.USDT || 0;

        Object.entries(wallet.balances).forEach(([symbol, amount]) => {
          if (symbol !== 'USDT' && amount > 0) {
            const price = currentPrices[`${symbol}USDT`] || 0;
            totalValue += amount * price;
          }
        });

        return totalValue;
      },

      // Get transaction history
      getTransactionHistory: (walletId = null, limit = 50) => {
        const { transactions } = get();
        
        let filteredTransactions = transactions;
        
        if (walletId) {
          filteredTransactions = transactions.filter(tx => 
            tx.wallet === walletId || 
            tx.fromWallet === walletId || 
            tx.toWallet === walletId
          );
        }

        return filteredTransactions.slice(0, limit);
      },

      // Reset all wallets
      resetWallets: () => {
        set({
          wallets: [
            {
              id: 'demo-wallet',
              name: 'Demo Wallet',
              type: 'demo',
              isActive: true,
              balances: {
                USDT: 10000,
                BTC: 0,
                ETH: 0,
                BNB: 0,
                SOL: 0,
                ADA: 0,
                DOT: 0,
                LINK: 0,
                XRP: 0
              }
            }
          ],
          activeWalletId: 'demo-wallet',
          transactions: []
        });
      }
    }),
    {
      name: 'neurofi-wallet-store',
      partialize: (state) => ({
        wallets: state.wallets,
        activeWalletId: state.activeWalletId,
        transactions: state.transactions
      })
    }
  )
);