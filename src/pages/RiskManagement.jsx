import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  DollarSign,
  Percent,
  Activity,
  Settings,
  RefreshCw
} from 'lucide-react';
import { PieChart, LineChart } from '../components/charts';

const RiskManagement = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 125430.50,
    riskScore: 65,
    volatility: 12.5,
    sharpeRatio: 1.85,
    maxDrawdown: -8.3,
    diversificationScore: 72
  });

  const [riskDistribution] = useState([
    { name: 'Low Risk', value: 30, color: '#10B981', amount: 37629.15 },
    { name: 'Medium Risk', value: 45, color: '#F59E0B', amount: 56443.73 },
    { name: 'High Risk', value: 25, color: '#EF4444', amount: 31357.63 }
  ]);

  const [assetAllocation] = useState([
    { name: 'Bitcoin', value: 40, risk: 'Medium', amount: 50172.20 },
    { name: 'Ethereum', value: 25, risk: 'Medium', amount: 31357.63 },
    { name: 'Stablecoins', value: 20, risk: 'Low', amount: 25086.10 },
    { name: 'Altcoins', value: 15, risk: 'High', amount: 18814.58 }
  ]);

  const [riskMetrics] = useState([
    { metric: 'Value at Risk (1d)', value: '-$3,245', change: '+2.1%', isGood: false },
    { metric: 'Expected Shortfall', value: '-$4,892', change: '-1.5%', isGood: true },
    { metric: 'Beta (vs BTC)', value: '0.85', change: '+0.05', isGood: true },
    { metric: 'Correlation', value: '0.72', change: '-0.03', isGood: true }
  ]);

  const [volatilityHistory] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volatility: Math.random() * 20 + 5,
      returns: (Math.random() - 0.5) * 10
    }))
  );

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-green-400';
    if (score <= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBgColor = (score) => {
    if (score <= 30) return 'bg-green-400/10 border-green-400/20';
    if (score <= 70) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  const getRiskLabel = (score) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 70) return 'Medium Risk';
    return 'High Risk';
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
          <h1 className="text-3xl font-bold text-white">
            Risk Management
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor and manage your portfolio risk exposure
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Risk Settings</span>
          </button>
          
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-green-400 text-sm font-medium">+5.67%</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${portfolioData.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Portfolio Value</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-6 border ${getRiskBgColor(portfolioData.riskScore)}`}
        >
          <div className="flex items-center justify-between mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className={`text-2xl font-bold mb-1 ${getRiskColor(portfolioData.riskScore)}`}>
            {portfolioData.riskScore}/100
          </div>
          <div className="text-sm text-gray-400">Risk Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-yellow-400 text-sm font-medium">+0.3%</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {portfolioData.volatility}%
          </div>
          <div className="text-sm text-gray-400">30d Volatility</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-green-400 text-sm font-medium">+0.12</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {portfolioData.sharpeRatio}
          </div>
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
        </motion.div>
      </div>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
            Risk Distribution
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 flex items-center justify-center">
              <PieChart 
                data={riskDistribution} 
                size={160} 
                innerRadius={40}
              />
            </div>
            
            <div className="space-y-4">
              {riskDistribution.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-300 text-sm">{item.name}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {item.value}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Asset Allocation
          </h3>
          
          <div className="space-y-4">
            {assetAllocation.map((asset, index) => (
              <div key={asset.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{asset.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      asset.risk === 'Low' ? 'bg-green-400/20 text-green-400' :
                      asset.risk === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {asset.risk}
                    </span>
                    <span className="text-white font-semibold">{asset.value}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${asset.value}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">
                  ${asset.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Risk Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {riskMetrics.map((metric, index) => (
            <motion.div
              key={metric.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-slate-700/30 rounded-lg p-4"
            >
              <div className="text-sm text-gray-400 mb-2">{metric.metric}</div>
              <div className="text-xl font-bold text-white mb-1">
                {metric.value}
              </div>
              <div className={`text-sm flex items-center space-x-1 ${
                metric.isGood ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.isGood ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{metric.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Volatility Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Portfolio Volatility (30 Days)
        </h3>
        
        <div className="h-64">
          <LineChart
            data={volatilityHistory}
            xKey="date"
            yKey="volatility"
            width={800}
            height={240}
            color="#5C6BF3"
            showGrid={true}
            showDots={true}
          />
        </div>
      </motion.div>

      {/* Risk Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
          Risk Alerts & Recommendations
        </h3>
        
        <div className="space-y-4">
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">
                  Medium Risk Alert
                </h4>
                <p className="text-gray-300 text-sm">
                  Your portfolio risk score has increased to 65/100. Consider rebalancing 
                  to reduce exposure to high-risk assets.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-semibold mb-1">
                  Diversification Recommendation
                </h4>
                <p className="text-gray-300 text-sm">
                  Consider adding more stablecoins or low-risk assets to improve 
                  your diversification score (currently 72/100).
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-green-400 font-semibold mb-1">
                  Good Performance
                </h4>
                <p className="text-gray-300 text-sm">
                  Your Sharpe ratio of 1.85 indicates good risk-adjusted returns. 
                  Continue monitoring for optimal performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskManagement;