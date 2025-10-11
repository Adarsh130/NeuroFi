import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  DollarSign,
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Plus,
  Zap
} from 'lucide-react';

const AddFundsModal = ({ isOpen, onClose, onFundsAdded }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('demo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [100, 500, 1000, 2500, 5000, 10000];

  const paymentMethods = [
    {
      id: 'demo',
      name: 'Demo Funds',
      description: 'Add virtual funds for testing',
      icon: Zap,
      color: 'from-primary to-accent',
      instant: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      color: 'from-blue-400 to-blue-600',
      instant: true,
      disabled: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'ACH transfer (1-3 business days)',
      icon: Banknote,
      color: 'from-green-400 to-green-600',
      instant: false,
      disabled: true
    },
    {
      id: 'crypto',
      name: 'Crypto Deposit',
      description: 'Deposit from external wallet',
      icon: Wallet,
      color: 'from-purple-400 to-purple-600',
      instant: true,
      disabled: true
    }
  ];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setError('');
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const fundAmount = parseFloat(amount);
    if (fundAmount < 10) {
      setError('Minimum deposit amount is $10');
      return;
    }

    if (fundAmount > 50000) {
      setError('Maximum deposit amount is $50,000');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (paymentMethod === 'demo') {
        // Add demo funds
        if (onFundsAdded) {
          onFundsAdded(fundAmount, 'USDT');
        }
        onClose();
      } else {
        // For real payment methods (disabled in demo)
        setError('Real payment methods are not available in demo mode');
      }
    } catch (error) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Plus className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add Funds</h2>
                  <p className="text-sm text-gray-400">Deposit money to your wallet</p>
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
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  min="10"
                  max="50000"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Min: $10.00</span>
                <span>Max: $50,000.00</span>
              </div>
            </div>

            {/* Predefined Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-2">
                {predefinedAmounts.map((preAmount) => (
                  <button
                    key={preAmount}
                    onClick={() => handleAmountSelect(preAmount)}
                    className={`p-3 rounded-lg border transition-colors text-sm font-medium ${
                      amount === preAmount.toString()
                        ? 'bg-primary border-primary text-white'
                        : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {formatCurrency(preAmount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => !method.disabled && setPaymentMethod(method.id)}
                      disabled={method.disabled}
                      className={`w-full p-4 rounded-lg border transition-colors text-left ${
                        paymentMethod === method.id
                          ? 'bg-primary/20 border-primary text-white'
                          : method.disabled
                          ? 'bg-slate-700/30 border-slate-600 text-gray-500 cursor-not-allowed'
                          : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-gradient-to-r ${method.color} rounded-lg ${method.disabled ? 'opacity-50' : ''}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm opacity-75">{method.description}</div>
                          {method.instant && !method.disabled && (
                            <div className="text-xs text-green-400 mt-1">Instant</div>
                          )}
                          {method.disabled && (
                            <div className="text-xs text-gray-500 mt-1">Coming Soon</div>
                          )}
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transaction Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Transaction Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Fee:</span>
                    <span className="text-green-400">$0.00</span>
                  </div>
                  <div className="border-t border-slate-600 pt-1 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-300">Total:</span>
                      <span className="text-white">{formatCurrency(parseFloat(amount))}</span>
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

            {/* Demo Notice */}
            {paymentMethod === 'demo' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-400">
                    <p className="font-medium mb-1">Demo Mode</p>
                    <p>These are virtual funds for testing purposes only. No real money will be charged.</p>
                  </div>
                </div>
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
                onClick={handleAddFunds}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add Funds</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddFundsModal;