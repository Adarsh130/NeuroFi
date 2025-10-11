import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { useWalletStore } from '../../store/walletStore';

const TradingModal = ({
  isOpen,
  onClose,
  symbol = 'BTCUSDT',
  action = 'BUY',
  currentPrice = 0,
  targetPrice = null,
  stopLoss = null,
  confidence = null,
  reasoning = null,
  onTradeComplete = null
}) => {
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [timeframe, setTimeframe] = useState('1d');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { openTrade } = useTradingStore();
  const { getActiveWallet, updateWalletBalance, addDemoFunds } = useWalletStore();

  const activeWallet = getActiveWallet();
  const availableBalance = activeWallet?.balances?.USDT || 0;

  // Calculate trade details
  const tradeAmount = parseFloat(amount) || 0;
  const requiredMargin = tradeAmount / leverage;
  const quantity = tradeAmount / currentPrice;
  const potentialProfit = action === 'BUY' 
    ? (targetPrice - currentPrice) * quantity
    : (currentPrice - targetPrice) * quantity;
  const potentialLoss = action === 'BUY'
    ? (currentPrice - stopLoss) * quantity
    : (stopLoss - currentPrice) * quantity;

  const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0;

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate trade amount
      const tradeAmount = parseFloat(amount);
      if (!tradeAmount || tradeAmount <= 0) {
        throw new Error('Please enter a valid trade amount');
      }

      // Check if user has sufficient balance
      const requiredBalance = tradeAmount / leverage;
      if (availableBalance < requiredBalance) {
        throw new Error(`Insufficient balance. Required: ${requiredBalance.toFixed(2)}, Available: ${availableBalance.toFixed(2)}`);
      }

      const tradeData = {
        symbol,
        action,
        amount: tradeAmount,
        quantity: tradeAmount / currentPrice,
        currentPrice,
        leverage,
        timeframe,
        targetPrice,
        stopLoss,
        confidence,
        reasoning
      };
      
      // Deduct funds from wallet
      updateWalletBalance(activeWallet.id, 'USDT', requiredBalance, 'subtract');
      
      // Open the trade
      const result = await openTrade(tradeData);
      
      console.log('Trade opened:', result);
      
      // Call the completion callback if provided
      if (onTradeComplete) {
        onTradeComplete({
          ...tradeData,
          id: result.id,
          walletDeduction: requiredBalance
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Trade failed:', error);
      setError(error.message || 'Trade execution failed');
    } finally {
      setIsSubmitting(false);
    }
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
                <div className={`p-2 rounded-lg ${
                  action === 'BUY' 
                    ? 'bg-green-400/10 text-green-400' 
                    : 'bg-red-400/10 text-red-400'
                }`}>
                  {action === 'BUY' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {action} {symbol.replace('USDT', '')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Current Price: ${currentPrice?.toFixed(2)}
                  </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* AI Confidence */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">AI Confidence</span>
                <span className="text-primary font-bold">{confidence}%</span>
              </div>
              <p className="text-sm text-gray-300">{reasoning}</p>
            </div>

            {/* Trade Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trade Amount (USDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  min="10"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Available: ${availableBalance.toFixed(2)}</span>
                <span>Min: $10.00</span>
              </div>
              {availableBalance < 100 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      addDemoFunds(1000);
                      setError('');
                    }}
                    className="text-xs text-primary hover:text-primary/80 underline"
                  >
                    Add $1,000 demo funds
                  </button>
                </div>
              )}
            </div>

            {/* Leverage */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leverage
              </label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>1x (No Leverage)</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expected Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
                <option value="3d">3 Days</option>
                <option value="1w">1 Week</option>
              </select>
            </div>

            {/* Trade Details */}
            {tradeAmount > 0 && (
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Trade Details</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white ml-2">{quantity.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Margin:</span>
                    <span className="text-white ml-2">${requiredMargin.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-gray-400">Target:</span>
                    <span className="text-green-400">${targetPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400">${stopLoss?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Potential Profit:</span>
                    <span className="text-green-400 ml-2">+${potentialProfit.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Potential Loss:</span>
                    <span className="text-red-400 ml-2">-${potentialLoss.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-400">Risk/Reward Ratio:</span>
                  <span className={`ml-2 font-medium ${
                    riskRewardRatio >= 2 ? 'text-green-400' :
                    riskRewardRatio >= 1 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    1:{riskRewardRatio.toFixed(2)}
                  </span>
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

            {/* Risk Warning */}
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-400">
                  <p className="font-medium mb-1">Risk Warning</p>
                  <p>This is a demo trading environment. No real money is involved. Cryptocurrency trading carries high risk.</p>
                </div>
              </div>
            </div>

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
                type="submit"
                disabled={isSubmitting || !amount || tradeAmount <= 0}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  action === 'BUY'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Open {action} Trade</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TradingModal;