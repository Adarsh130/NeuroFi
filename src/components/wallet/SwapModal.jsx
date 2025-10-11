import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Info,
  Zap
} from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { useMultipleRealTimeData } from '../../hooks/useRealTimeMarketData';

const SwapModal = ({ isOpen, onClose, onSwapComplete }) => {
  const [fromToken, setFromToken] = useState('BTC');
  const [toToken, setToToken] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [swapRate, setSwapRate] = useState(null);
  const [slippage, setSlippage] = useState(0.5);
  const [error, setError] = useState('');
  const [priceImpact, setPriceImpact] = useState(0);

  const { getActiveWallet, updateWalletBalance, swapCrypto } = useWalletStore();
  const activeWallet = getActiveWallet();

  // Real-time market data
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'];
  const { data: marketData, getAllPrices } = useMultipleRealTimeData(symbols);
  const currentPrices = getAllPrices();

  // Token data with real-time prices and balances
  const tokens = {
    BTC: { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      price: currentPrices['BTCUSDT'] || 43250, 
      balance: activeWallet?.balances?.BTC || 0, 
      icon: '₿',
      color: 'from-orange-400 to-orange-600'
    },
    ETH: { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      price: currentPrices['ETHUSDT'] || 2650, 
      balance: activeWallet?.balances?.ETH || 0, 
      icon: 'Ξ',
      color: 'from-blue-400 to-blue-600'
    },
    BNB: { 
      name: 'Binance Coin', 
      symbol: 'BNB', 
      price: currentPrices['BNBUSDT'] || 315, 
      balance: activeWallet?.balances?.BNB || 0, 
      icon: 'B',
      color: 'from-yellow-400 to-yellow-600'
    },
    SOL: { 
      name: 'Solana', 
      symbol: 'SOL', 
      price: currentPrices['SOLUSDT'] || 98, 
      balance: activeWallet?.balances?.SOL || 0, 
      icon: 'S',
      color: 'from-purple-400 to-purple-600'
    },
    ADA: { 
      name: 'Cardano', 
      symbol: 'ADA', 
      price: currentPrices['ADAUSDT'] || 0.45, 
      balance: activeWallet?.balances?.ADA || 0, 
      icon: 'A',
      color: 'from-blue-400 to-cyan-600'
    },
    XRP: { 
      name: 'Ripple', 
      symbol: 'XRP', 
      price: currentPrices['XRPUSDT'] || 0.52, 
      balance: activeWallet?.balances?.XRP || 0, 
      icon: 'X',
      color: 'from-gray-400 to-gray-600'
    },
    DOT: { 
      name: 'Polkadot', 
      symbol: 'DOT', 
      price: currentPrices['DOTUSDT'] || 7.2, 
      balance: activeWallet?.balances?.DOT || 0, 
      icon: 'D',
      color: 'from-pink-400 to-pink-600'
    },
    LINK: { 
      name: 'Chainlink', 
      symbol: 'LINK', 
      price: currentPrices['LINKUSDT'] || 14.5, 
      balance: activeWallet?.balances?.LINK || 0, 
      icon: 'L',
      color: 'from-blue-400 to-indigo-600'
    }
  };

  // Calculate swap rate and amounts
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const fromPrice = tokens[fromToken]?.price || 0;
      const toPrice = tokens[toToken]?.price || 0;
      
      if (fromPrice && toPrice) {
        const rate = fromPrice / toPrice;
        setSwapRate(rate);
        
        // Calculate to amount with slippage
        const baseToAmount = parseFloat(fromAmount) * rate;
        const slippageAmount = baseToAmount * (slippage / 100);
        const finalToAmount = baseToAmount - slippageAmount;
        
        setToAmount(finalToAmount.toFixed(6));
        
        // Calculate price impact (mock calculation)
        const impact = Math.min((parseFloat(fromAmount) / 1000) * 0.1, 5);
        setPriceImpact(impact);
      }
    } else {
      setToAmount('');
      setSwapRate(null);
      setPriceImpact(0);
    }
  }, [fromAmount, fromToken, toToken, slippage]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    const balance = tokens[fromToken]?.balance || 0;
    setFromAmount(balance.toString());
    setError('');
  };

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      setError('Please enter an amount to swap');
      return;
    }

    const fromBalance = tokens[fromToken]?.balance || 0;
    const fromAmountNum = parseFloat(fromAmount);
    const toAmountNum = parseFloat(toAmount);

    if (fromAmountNum <= 0 || toAmountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (fromAmountNum > fromBalance) {
      setError(`Insufficient ${fromToken} balance. Available: ${fromBalance.toFixed(8)}`);
      return;
    }

    // Minimum swap amounts
    const minSwapValue = 1; // $1 minimum
    const fromValue = fromAmountNum * tokens[fromToken].price;
    if (fromValue < minSwapValue) {
      setError(`Minimum swap value is ${minSwapValue}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Execute the swap transaction
      const transaction = swapCrypto(
        fromToken, 
        toToken, 
        fromAmountNum, 
        toAmountNum, 
        tokens[fromToken].price, 
        tokens[toToken].price
      );
      
      const swapData = {
        type: 'swap',
        fromToken,
        toToken,
        fromAmount: fromAmountNum,
        toAmount: toAmountNum,
        rate: swapRate,
        slippage,
        priceImpact,
        timestamp: new Date(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      console.log('Swap completed:', swapData);
      
      if (onSwapComplete) {
        onSwapComplete(swapData);
      }
      
      onClose();
    } catch (error) {
      setError('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount, decimals = 2) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const getTokenIcon = (symbol) => {
    const token = tokens[symbol];
    return (
      <div className={`h-8 w-8 bg-gradient-to-r ${token?.color || 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
        {token?.icon || symbol[0]}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Swap Crypto</h2>
                  <p className="text-sm text-gray-400">Exchange one cryptocurrency for another</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* From Token */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">From</label>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="bg-transparent text-white font-medium text-lg focus:outline-none"
                  >
                    {Object.entries(tokens).map(([symbol, token]) => (
                      <option key={symbol} value={symbol} className="bg-slate-800">
                        {symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  {getTokenIcon(fromToken)}
                </div>
                
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-white text-2xl font-bold focus:outline-none flex-1"
                    step="any"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    MAX
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                  <span>
                    ≈ ${formatCurrency((parseFloat(fromAmount) || 0) * (tokens[fromToken]?.price || 0))}
                  </span>
                  <span>
                    Balance: {formatCurrency(tokens[fromToken]?.balance || 0, 6)} {fromToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwapTokens}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
              >
                <ArrowUpDown className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">To</label>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="bg-transparent text-white font-medium text-lg focus:outline-none"
                  >
                    {Object.entries(tokens).map(([symbol, token]) => (
                      <option key={symbol} value={symbol} className="bg-slate-800">
                        {symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  {getTokenIcon(toToken)}
                </div>
                
                <div className="text-2xl font-bold text-white">
                  {toAmount || '0.00'}
                </div>
                
                <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                  <span>
                    ≈ ${formatCurrency((parseFloat(toAmount) || 0) * (tokens[toToken]?.price || 0))}
                  </span>
                  <span>
                    Balance: {formatCurrency(tokens[toToken]?.balance || 0, 6)} {toToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {swapRate && (
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Swap Details
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exchange Rate:</span>
                    <span className="text-white">1 {fromToken} = {swapRate.toFixed(6)} {toToken}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Impact:</span>
                    <span className={`${priceImpact > 3 ? 'text-red-400' : priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slippage Tolerance:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={slippage}
                        onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                        className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-xs"
                        step="0.1"
                        min="0.1"
                        max="50"
                      />
                      <span className="text-white">%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee:</span>
                    <span className="text-white">~$2.50</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Received:</span>
                    <span className="text-white">
                      {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slippage Warning */}
            {priceImpact > 3 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-400">
                  <p className="font-medium">High Price Impact</p>
                  <p>This swap will significantly affect the token price. Consider reducing the amount.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwap}
                disabled={isLoading || !fromAmount || !toAmount || !!error}
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Swapping...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Swap</span>
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-400">
                  <p className="font-medium mb-1">Demo Mode</p>
                  <p>This is a simulated swap using demo funds. Balances will be updated instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SwapModal;