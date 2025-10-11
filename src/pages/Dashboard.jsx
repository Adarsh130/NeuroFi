import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MarketOverview from '../components/dashboard/MarketOverview';
import SentimentWidget from '../components/dashboard/SentimentWidget';
import AiRecommendations from '../components/dashboard/AiRecommendations';
import RiskGauge from '../components/dashboard/RiskGauge';
import SystemStatus from '../components/common/SystemStatus';
import { useWalletStore } from '../store/walletStore';
import { useTradingStore } from '../store/tradingStore';
import { useMultipleRealTimeData } from '../hooks/useRealTimeMarketData';
import { LayoutDashboard, TrendingUp, Brain, Activity, User } from 'lucide-react';

const Dashboard = () => {
  const { user, backendConnected } = useAuth();
  
  // Get real-time data from stores
  const { getActiveWallet, getWalletValue } = useWalletStore();
  const { activeTrades } = useTradingStore();
  
  // Real-time market data
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'LINKUSDT'];
  const { getAllPrices } = useMultipleRealTimeData(symbols);
  const currentPrices = getAllPrices();
  
  // Get active wallet and calculate real values
  const activeWallet = getActiveWallet();
  const portfolioValue = activeWallet ? getWalletValue(activeWallet.id, currentPrices) : 0;
  const activePositionsCount = activeTrades.length;
  
  // Calculate portfolio change (mock calculation for demo)
  const initialValue = 10000; // Starting demo balance
  const portfolioChange = portfolioValue - initialValue;
  const portfolioChangePercent = (portfolioChange / initialValue) * 100;
  
  // Calculate AI confidence based on active trades performance
  const aiConfidence = activeTrades.length > 0 
    ? Math.min(95, Math.max(60, 75 + (activeTrades.filter(t => (t.pnl || 0) > 0).length / activeTrades.length) * 20))
    : 75;
  
  // Calculate risk score based on portfolio allocation
  const riskScore = Math.min(100, Math.max(20, 50 + (activePositionsCount * 5)));
  
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatPercentage = (percentage) => {
    if (typeof percentage !== 'number' || isNaN(percentage)) return '0.00%';
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const quickStats = [
    {
      label: 'Portfolio Value',
      value: formatCurrency(portfolioValue),
      change: formatPercentage(portfolioChangePercent),
      isPositive: portfolioChange >= 0,
      icon: TrendingUp
    },
    {
      label: 'Active Positions',
      value: activePositionsCount.toString(),
      change: activePositionsCount > 0 ? `+${activePositionsCount}` : '0',
      isPositive: activePositionsCount > 0,
      icon: Activity
    },
    {
      label: 'AI Confidence',
      value: `${Math.round(aiConfidence)}%`,
      change: aiConfidence > 75 ? '+High' : aiConfidence > 60 ? 'Medium' : 'Low',
      isPositive: aiConfidence > 75,
      icon: Brain
    },
    {
      label: 'Risk Score',
      value: `${Math.round(riskScore)}/100`,
      change: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
      isPositive: riskScore <= 70,
      icon: LayoutDashboard
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            Welcome back{user ? `, ${user.firstName || user.name}` : ''}! Here's your trading overview.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600 dark:text-gray-400">Last updated</div>
          <div className="text-slate-900 dark:text-white font-medium">{new Date().toLocaleTimeString()}</div>
        </div>
      </motion.div>

      {/* User Info & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {user ? user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.email : 'Guest User'}
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                {user ? user.email : 'Not logged in'}
              </p>
              {user?.preferences?.watchlist && (
                <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">
                  Watching {user.preferences.watchlist.length} cryptocurrencies
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SystemStatus />
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-primary" />
                <span className={`text-sm font-medium ${
                  stat.isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketOverview />
        <SentimentWidget />
        <AiRecommendations />
        <RiskGauge />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            {
              action: 'Portfolio Update',
              description: `Portfolio value: ${formatCurrency(portfolioValue)}`,
              time: 'Live',
              type: 'portfolio'
            },
            {
              action: 'Active Positions',
              description: `${activePositionsCount} positions currently active`,
              time: 'Live',
              type: 'positions'
            },
            {
              action: 'Market Data',
              description: `BTC: ${formatCurrency(currentPrices.BTCUSDT || 0)} | ETH: ${formatCurrency(currentPrices.ETHUSDT || 0)}`,
              time: 'Live',
              type: 'market'
            },
            {
              action: 'AI Confidence',
              description: `AI confidence level at ${Math.round(aiConfidence)}%`,
              time: 'Live',
              type: 'ai'
            }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.7 }}
              className="flex items-center justify-between p-3 bg-slate-200/50 dark:bg-slate-700/30 rounded-lg"
            >
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{activity.action}</div>
                <div className="text-sm text-slate-600 dark:text-gray-400">{activity.description}</div>
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-500">{activity.time}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;