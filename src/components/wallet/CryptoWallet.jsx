import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  ArrowUpDown,
  Send,
  Download,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  StarOff,
  Copy,
  ExternalLink,
  Activity,
  PieChart,
  BarChart3,
  Zap
} from 'lucide-react';
import SwapModal from './SwapModal';
import AddFundsModal from './AddFundsModal';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import { useWalletStore } from '../../store/walletStore';
import { useTradingStore } from '../../store/tradingStore';
import { useRealTimeMarketData, useMultipleRealTimeData } from '../../hooks/useRealTimeMarketData';

const CryptoWallet = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('value');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Helper functions (moved to top to avoid hoisting issues)
  const getTokenName = (symbol) => {
    const names = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum', 
      BNB: 'Binance Coin',
      SOL: 'Solana',
      ADA: 'Cardano',
      XRP: 'Ripple',
      DOT: 'Polkadot',
      LINK: 'Chainlink'
    };
    return names[symbol] || symbol;
  };

  const getTokenColor = (symbol) => {
    const colors = {
      BTC: 'from-orange-400 to-orange-600',
      ETH: 'from-blue-400 to-blue-600',
      BNB: 'from-yellow-400 to-yellow-600',
      SOL: 'from-purple-400 to-purple-600',
      ADA: 'from-blue-400 to-cyan-600',
      XRP: 'from-gray-400 to-gray-600',
      DOT: 'from-pink-400 to-pink-600',
      LINK: 'from-blue-400 to-indigo-600'
    };
    return colors[symbol] || 'from-gray-400 to-gray-600';
  };

  const getTokenIcon = (symbol, color) => (
    <div className={`h-10 w-10 bg-gradient-to-r ${color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
      {symbol[0]}
    </div>
  );

  // Store hooks
  const { 
    getActiveWallet, 
    updateWalletBalance, 
    addDemoFunds, 
    getWalletValue, 
    getTransactionHistory 
  } = useWalletStore();
  const { activeTrades, tradeHistory, closeTrade } = useTradingStore();

  // Get active wallet
  const activeWallet = getActiveWallet();

  // Real-time market data for multiple symbols
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'];
  const { data: marketData, getAllPrices } = useMultipleRealTimeData(symbols);
  const currentPrices = getAllPrices();

  // Calculate wallet data from stores and real-time prices
  const calculateWalletData = () => {
    if (!activeWallet) return null;

    const holdings = [];
    let totalValue = activeWallet.balances.USDT || 0;
    const initialValue = 10000; // Starting demo balance

    // Process crypto holdings
    Object.entries(activeWallet.balances).forEach(([symbol, amount]) => {
      if (symbol !== 'USDT' && amount > 0) {
        const symbolPair = `${symbol}USDT`;
        const currentPrice = currentPrices[symbolPair] || 0;
        const value = amount * currentPrice;
        totalValue += value;

        holdings.push({
          symbol,
          name: getTokenName(symbol),
          amount,
          price: currentPrice,
          value,
          allocation: 0, // Will be calculated after totalValue is known
          favorite: ['BTC', 'ETH', 'SOL'].includes(symbol),
          color: getTokenColor(symbol),
          pnl: 0, // Will be calculated based on purchase history
          pnlPercentage: 0
        });
      }
    });

    // Calculate allocations
    holdings.forEach(holding => {
      holding.allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
    });

    // Add active trades value
    activeTrades.forEach(trade => {
      const currentPrice = currentPrices[trade.symbol] || trade.currentPrice;
      const tradeValue = trade.amount + (trade.pnl || 0);
      totalValue += tradeValue;
    });

    const totalPnL = totalValue - initialValue;
    const totalPnLPercentage = (totalPnL / initialValue) * 100;

    return {
      totalBalance: totalValue,
      totalPnL,
      totalPnLPercentage,
      availableCash: activeWallet.balances.USDT || 0,
      holdings: holdings.sort((a, b) => b.value - a.value),
      recentTransactions: getTransactionHistory(activeWallet.id, 10)
    };
  };

  const walletData = calculateWalletData();

  // Update wallet data when prices change
  useEffect(() => {
    // Force re-calculation when prices update
    const interval = setInterval(() => {
      // This will trigger a re-render with updated prices
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentPrices]);

  const filteredHoldings = walletData?.holdings
    ?.filter(holding => 
      holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holding.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value - a.value;
        case 'allocation':
          return b.allocation - a.allocation;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    }) || [];

  const formatCurrency = (amount, decimals = 2) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return `$${amount.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  };

  const formatCrypto = (amount, decimals = 6) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0';
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: Math.min(decimals, 2), 
      maximumFractionDigits: decimals 
    });
  };

  const formatPercentage = (percentage) => {
    if (typeof percentage !== 'number' || isNaN(percentage)) return '0.00%';
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force wallet data recalculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSwapComplete = (swapData) => {
    console.log('Swap completed:', swapData);
    // Swap is handled by the SwapModal internally
  };

  const handleBuyComplete = (buyData) => {
    console.log('Buy completed:', buyData);
    // Buy is handled by the BuyModal internally
  };

  const handleSellComplete = (sellData) => {
    console.log('Sell completed:', sellData);
    // Sell is handled by the SellModal internally
  };

  const handleAddFunds = (amount, symbol = 'USDT') => {
    addDemoFunds(amount, symbol);
  };

  const handleCloseTrade = async (tradeId) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (trade) {
      const currentPrice = currentPrices[trade.symbol] || trade.currentPrice;
      const closedTrade = await closeTrade(tradeId, currentPrice);
      
      // Add the P&L back to wallet
      const finalAmount = (trade.amount / trade.leverage) + closedTrade.pnl;
      updateWalletBalance(activeWallet.id, 'USDT', finalAmount, 'add');
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Wallet</h1>
          <p className="text-gray-400 mt-1">
            Manage your crypto portfolio
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            {showBalance ? <Eye className="h-5 w-5 text-white" /> : <EyeOff className="h-5 w-5 text-white" />}
          </button>
        </div>
      </motion.div>

      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <WalletIcon className="h-6 w-6 text-primary" />
              <span className="text-gray-400">Total Portfolio Value</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {showBalance ? formatCurrency(walletData?.totalBalance || 0) : '••••••'}
            </div>
            <div className={`flex items-center justify-center md:justify-start space-x-1 ${
              (walletData?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(walletData?.totalPnL || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {showBalance ? formatCurrency(walletData?.totalPnL || 0) : '••••'} ({formatPercentage(walletData?.totalPnLPercentage || 0)})
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-gray-400 mb-2">Available Cash</div>
            <div className="text-2xl font-bold text-white mb-2">
              {showBalance ? formatCurrency(walletData?.availableCash || 0) : '••••••'}
            </div>
            <div className="text-sm text-gray-400">Ready to invest</div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-gray-400 mb-2">Assets</div>
            <div className="text-2xl font-bold text-white mb-2">
              {walletData?.holdings?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Cryptocurrencies</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <button 
          onClick={() => setShowBuyModal(true)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors group"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors">
              <Plus className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-white font-medium">Buy</span>
          </div>
        </button>

        <button 
          onClick={() => setShowSellModal(true)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors group"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-red-500/20 rounded-full group-hover:bg-red-500/30 transition-colors">
              <Minus className="h-6 w-6 text-red-400" />
            </div>
            <span className="text-white font-medium">Sell</span>
          </div>
        </button>

        <button 
          onClick={() => setShowSwapModal(true)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors group"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors">
              <ArrowUpDown className="h-6 w-6 text-primary" />
            </div>
            <span className="text-white font-medium">Swap</span>
          </div>
        </button>

        <button 
          onClick={() => setShowAddFundsModal(true)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors group"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-blue-500/20 rounded-full group-hover:bg-blue-500/30 transition-colors">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-white font-medium">Add Funds</span>
          </div>
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'holdings', label: 'Holdings', icon: BarChart3 },
          { id: 'transactions', label: 'Transactions', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'holdings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="value">Sort by Value</option>
              <option value="pnl">Sort by P&L</option>
              <option value="allocation">Sort by Allocation</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Holdings List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {filteredHoldings.map((holding, index) => (
              <motion.div
                key={holding.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTokenIcon(holding.symbol, holding.color)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{holding.name}</h3>
                        <span className="text-gray-400 text-sm">{holding.symbol}</span>
                        <div className="text-gray-400">
                          {holding.favorite ? (
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{formatCrypto(holding.amount || 0)} {holding.symbol}</span>
                        <span>•</span>
                        <span>{formatCurrency(holding.price || 0)}</span>
                        <span>•</span>
                        <span>{(holding.allocation || 0).toFixed(1)}% of portfolio</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {showBalance ? formatCurrency(holding.value) : '••••••'}
                    </div>
                    <div className={`text-sm ${
                      (holding.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {showBalance ? formatCurrency(holding.pnl || 0) : '••••'} ({formatPercentage(holding.pnlPercentage || 0)})
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
        >
          {(walletData?.recentTransactions || []).map((transaction, index) => (
            <div
              key={index}
              className="p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'buy' ? 'bg-green-500/20' :
                    transaction.type === 'sell' ? 'bg-red-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {transaction.type === 'buy' ? (
                      <Plus className="h-4 w-4 text-green-400" />
                    ) : transaction.type === 'sell' ? (
                      <Minus className="h-4 w-4 text-red-400" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {transaction.type === 'swap' 
                        ? `Swapped ${transaction.fromSymbol} to ${transaction.toSymbol}`
                        : `${transaction.type === 'buy' ? 'Bought' : 'Sold'} ${transaction.symbol}`
                      }
                    </div>
                    <div className="text-sm text-gray-400">
                      {transaction.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {transaction.type === 'swap' 
                      ? `${formatCrypto(transaction.fromAmount)} → ${formatCrypto(transaction.toAmount)}`
                      : formatCurrency(transaction.value)
                    }
                  </div>
                  <div className="text-sm text-green-400">Completed</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Portfolio Allocation */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Portfolio Allocation</h3>
            <div className="space-y-4">
              {(walletData?.holdings || []).slice(0, 5).map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTokenIcon(holding.symbol, holding.color)}
                    <div>
                      <div className="font-medium text-white">{holding.symbol}</div>
                      <div className="text-sm text-gray-400">{holding.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{holding.allocation.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">
                      {showBalance ? formatCurrency(holding.value) : '••••••'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Invested</span>
                <span className="text-white font-medium">
                  {showBalance ? formatCurrency((walletData?.totalBalance || 0) - (walletData?.totalPnL || 0)) : '••••••'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Value</span>
                <span className="text-white font-medium">
                  {showBalance ? formatCurrency(walletData?.totalBalance || 0) : '••••••'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total P&L</span>
                <span className={`font-medium ${(walletData?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {showBalance ? formatCurrency(walletData?.totalPnL || 0) : '••••••'} ({formatPercentage(walletData?.totalPnLPercentage || 0)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Performer</span>
                <span className="text-green-400 font-medium">SOL (+22.5%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available Cash</span>
                <span className="text-white font-medium">
                  {showBalance ? formatCurrency(walletData?.availableCash || 0) : '••••••'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <BuyModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onBuyComplete={handleBuyComplete}
      />
      
      <SellModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        onSellComplete={handleSellComplete}
      />
      
      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSwapComplete={handleSwapComplete}
      />
      
      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onFundsAdded={handleAddFunds}
      />
    </div>
  );
};

export default CryptoWallet;