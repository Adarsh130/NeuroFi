import { motion } from 'framer-motion';
import MarketOverview from '../components/dashboard/MarketOverview';
import SentimentWidget from '../components/dashboard/SentimentWidget';
import AiRecommendations from '../components/dashboard/AiRecommendations';
import RiskGauge from '../components/dashboard/RiskGauge';
import { LayoutDashboard, TrendingUp, Brain, Activity } from 'lucide-react';

const Dashboard = () => {
  const quickStats = [
    {
      label: 'Portfolio Value',
      value: '$125,430.50',
      change: '+5.67%',
      isPositive: true,
      icon: TrendingUp
    },
    {
      label: 'Active Positions',
      value: '12',
      change: '+2',
      isPositive: true,
      icon: Activity
    },
    {
      label: 'AI Confidence',
      value: '87%',
      change: '+3%',
      isPositive: true,
      icon: Brain
    },
    {
      label: 'Risk Score',
      value: '65/100',
      change: '-5',
      isPositive: true,
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Welcome back! Here's your trading overview.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600 dark:text-gray-400">Last updated</div>
          <div className="text-slate-900 dark:text-white font-medium">{new Date().toLocaleTimeString()}</div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            {
              action: 'AI Recommendation',
              description: 'BUY signal generated for BTCUSDT',
              time: '2 minutes ago',
              type: 'recommendation'
            },
            {
              action: 'Market Alert',
              description: 'ETHUSDT broke resistance at $2,650',
              time: '15 minutes ago',
              type: 'alert'
            },
            {
              action: 'Sentiment Update',
              description: 'Bitcoin sentiment improved to 78%',
              time: '1 hour ago',
              type: 'sentiment'
            },
            {
              action: 'Risk Warning',
              description: 'Portfolio risk increased to 65%',
              time: '2 hours ago',
              type: 'risk'
            }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
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