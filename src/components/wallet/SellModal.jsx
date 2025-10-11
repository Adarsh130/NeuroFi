import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Minus,
  Zap
} from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { useMultipleRealTimeData } from '../../hooks/useRealTimeMarketData';

const SellModal = ({ isOpen, onClose, onSellComplete, initialSymbol = 'BTC' }) => {
  const [selectedCrypto, setSelectedCrypto] = useState(initialSymbol);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('crypto'); // 'crypto' or 'usdt'

  const { getActiveWallet, updateWalletBalance, sellCrypto } = useWalletStore();
  const activeWallet = getActiveWallet();

  // Real-time market data
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'];
  const { data: marketData, getAllPrices } = useMultipleRealTimeData(symbols);
  const currentPrices = getAllPrices();

  // Available cryptocurrencies (only show ones with balance)
  const cryptos = {
    BTC: { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      icon: '₿',
      color: 'from-orange-400 to-orange-600',
      minSell: 0.0001
    },
    ETH: { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      icon: 'Ξ',
      color: 'from-blue-400 to-blue-600',
      minSell: 0.001
    },
    BNB: { 
      name: 'Binance Coin', 
      symbol: 'BNB', 
      icon: 'B',
      color: 'from-yellow-400 to-yellow-600',
      minSell: 0.01
    },
    SOL: { 
      name: 'Solana', 
      symbol: 'SOL', 
      icon: 'S',
      color: 'from-purple-400 to-purple-600',
      minSell: 0.01
    },
    ADA: { 
      name: 'Cardano', 
      symbol: 'ADA', 
      icon: 'A',
      color: 'from-blue-400 to-cyan-600',
      minSell: 1
    },
    XRP: { 
      name: 'Ripple', 
      symbol: 'XRP', 
      icon: 'X',
      color: 'from-gray-400 to-gray-600',
      minSell: 1
    },
    DOT: { 
      name: 'Polkadot', 
      symbol: 'DOT', 
      icon: 'D',
      color: 'from-pink-400 to-pink-600',
      minSell: 0.1
    },
    LINK: { 
      name: 'Chainlink', 
      symbol: 'LINK', 
      icon: 'L',
      color: 'from-blue-400 to-indigo-600',
      minSell: 0.1
    }
  };

  const currentPrice = currentPrices[`${selectedCrypto}USDT`] || 0;
  const availableCrypto = activeWallet?.balances?.[selectedCrypto] || 0;
  const crypto = cryptos[selectedCrypto];

  // Filter cryptos to only show ones with balance
  const availableCryptos = Object.entries(cryptos).filter(([symbol]) => 
    (activeWallet?.balances?.[symbol] || 0) > 0
  );

  // Calculate amounts based on input
  useEffect(() => {
    if (currentPrice > 0) {
      if (inputMode === 'crypto' && cryptoAmount) {
        const usdtValue = parseFloat(cryptoAmount) * currentPrice;
        setUsdtAmount(usdtValue.toFixed(2));
      } else if (inputMode === 'usdt' && usdtAmount) {
        const cryptoValue = parseFloat(usdtAmount) / currentPrice;
        setCryptoAmount(cryptoValue.toFixed(8));
      }
    }
  }, [cryptoAmount, usdtAmount, currentPrice, inputMode]);

  const handleCryptoAmountChange = (value) => {
    setInputMode('crypto');
    setCryptoAmount(value);
    setError('');
  };

  const handleUsdtAmountChange = (value) => {
    setInputMode('usdt');
    setUsdtAmount(value);
    setError('');
  };

  const handleMaxClick = () => {
    setInputMode('crypto');
    setCryptoAmount(availableCrypto.toString());
    setError('');
  };

  const handleQuickAmount = (percentage) => {
    const amount = (availableCrypto * percentage / 100).toFixed(8);
    setInputMode('crypto');
    setCryptoAmount(amount);
    setError('');
  };

  const handleSell = async () => {
    if (!cryptoAmount || !usdtAmount) {
      setError('Please enter an amount to sell');
      return;
    }

    const cryptoValue = parseFloat(cryptoAmount);
    const usdtValue = parseFloat(usdtAmount);

    if (cryptoValue <= 0 || usdtValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (cryptoValue > availableCrypto) {
      setError(`Insufficient ${selectedCrypto} balance. Available: ${availableCrypto.toFixed(8)}`);
      return;
    }

    if (cryptoValue < crypto.minSell) {
      setError(`Minimum sell amount is ${crypto.minSell} ${selectedCrypto}`);
      return;
    }

    if (usdtValue < 1) {
      setError('Minimum sell value is $1.00');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Execute the sell transaction
      const transaction = sellCrypto(selectedCrypto, cryptoValue, currentPrice);

      const sellData = {
        type: 'sell',
        symbol: selectedCrypto,
        cryptoAmount: cryptoValue,
        usdtAmount: usdtValue,
        price: currentPrice,
        timestamp: new Date(),
        transaction
      };

      console.log('Sell completed:', sellData);

      if (onSellComplete) {
        onSellComplete(sellData);
      }

      onClose();
    } catch (error) {
      setError(error.message || 'Sell transaction failed. Please try again.');
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

  const formatCrypto = (amount, decimals = 8) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0';
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: Math.min(decimals, 2), 
      maximumFractionDigits: decimals 
    });
  };

  const getTokenIcon = (symbol) => {
    const token = cryptos[symbol];
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
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Minus className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Sell Crypto</h2>
                  <p className="text-sm text-gray-400">Convert cryptocurrency to USDT</p>
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
            {/* No Holdings Message */}
            {availableCryptos.length === 0 && (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Crypto Holdings</h3>
                <p className="text-gray-400 text-sm">You don't have any cryptocurrency to sell. Buy some crypto first!</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Crypto Selection */}
            {availableCryptos.length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Cryptocurrency to Sell
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableCryptos.map(([symbol, crypto]) => {
                      const balance = activeWallet?.balances?.[symbol] || 0;
                      const value = balance * (currentPrices[`${symbol}USDT`] || 0);
                      
                      return (
                        <button
                          key={symbol}
                          onClick={() => setSelectedCrypto(symbol)}
                          className={`p-3 rounded-lg border transition-colors ${
                            selectedCrypto === symbol
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {getTokenIcon(symbol)}
                            <div className="text-left">
                              <div className="font-medium">{symbol}</div>
                              <div className="text-xs opacity-75">{formatCrypto(balance, 4)} • ${formatCurrency(value)}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input - Crypto */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount to Sell ({selectedCrypto})
                  </label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTokenIcon(selectedCrypto)}
                        <span className="text-white font-medium">{selectedCrypto}</span>
                      </div>
                      <button
                        onClick={handleMaxClick}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        MAX
                      </button>
                    </div>
                    
                    <input
                      type="number"
                      value={cryptoAmount}
                      onChange={(e) => handleCryptoAmountChange(e.target.value)}
                      placeholder="0.00000000"
                      className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none"
                      step="any"
                    />
                    
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                      <span>Available: {formatCrypto(availableCrypto)} {selectedCrypto}</span>
                      <span>Min: {crypto?.minSell} {selectedCrypto}</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[25, 50, 75, 100].map((percentage) => (
                      <button
                        key={percentage}
                        onClick={() => handleQuickAmount(percentage)}
                        className="py-2 px-3 bg-slate-700/50 border border-slate-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-600/50 transition-colors"
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input - USDT */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    You Will Receive (USDT)
                  </label>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <span className="text-white font-medium">USDT</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        ${formatCurrency(currentPrice)}
                      </div>
                    </div>
                    
                    <input
                      type="number"
                      value={usdtAmount}
                      onChange={(e) => handleUsdtAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none"
                      step="0.01"
                    />
                    
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                      <span>Current USDT: ${formatCurrency(activeWallet?.balances?.USDT || 0)}</span>
                      <span>Min: $1.00</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Summary */}
                {cryptoAmount && usdtAmount && currentPrice > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Transaction Summary
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price per {selectedCrypto}:</span>
                        <span className="text-white">${formatCurrency(currentPrice)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount to sell:</span>
                        <span className="text-white">{formatCrypto(parseFloat(cryptoAmount))} {selectedCrypto}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">You will receive:</span>
                        <span className="text-white">${formatCurrency(parseFloat(usdtAmount))}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trading Fee:</span>
                        <span className="text-green-400">$0.00 (Demo)</span>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-300">Total Received:</span>
                          <span className="text-white">${formatCurrency(parseFloat(usdtAmount))}</span>
                        </div>
                      </div>
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
                    onClick={handleSell}
                    disabled={isLoading || !cryptoAmount || !usdtAmount || !!error}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Selling...</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4" />
                        <span>Sell {selectedCrypto}</span>
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
                      <p>This is a simulated sale using demo funds. No real cryptocurrency will be sold.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SellModal;