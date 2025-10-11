import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart } from '../charts';

const RiskGauge = () => {
  // Mock risk data
  const riskLevel = 65; // 0-100
  const portfolioRisk = {
    low: 30,
    medium: 45,
    high: 25
  };

  const getRiskColor = (level) => {
    if (level <= 30) return '#10B981'; // Green
    if (level <= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getRiskLabel = (level) => {
    if (level <= 30) return 'Low Risk';
    if (level <= 70) return 'Medium Risk';
    return 'High Risk';
  };

  // Data for the risk gauge (semi-circle)
  const gaugeData = [
    { name: 'Risk', value: riskLevel, color: getRiskColor(riskLevel) },
    { name: 'Remaining', value: 100 - riskLevel, color: '#374151' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Risk Management
        </h3>
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
      </div>

      {/* Risk Gauge */}
      <div className="relative mb-6 flex justify-center">
        <div className="relative">
          <PieChart 
            data={gaugeData} 
            size={140} 
            innerRadius={50}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getRiskColor(riskLevel) }}>
                {riskLevel}%
              </div>
              <div className="text-xs text-gray-400">{getRiskLabel(riskLevel)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Low Risk Assets</span>
          <span className="text-green-400 font-medium">{portfolioRisk.low}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Medium Risk Assets</span>
          <span className="text-yellow-400 font-medium">{portfolioRisk.medium}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">High Risk Assets</span>
          <span className="text-red-400 font-medium">{portfolioRisk.high}%</span>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
        <div className="text-center">
          <div className="text-sm text-gray-400">Volatility</div>
          <div className="text-lg font-semibold text-yellow-400">12.5%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
          <div className="text-lg font-semibold text-green-400 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            1.85
          </div>
        </div>
      </div>

      {/* Risk Alert */}
      <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 font-medium">Risk Alert</span>
        </div>
        <p className="text-xs text-gray-300 mt-1">
          Consider rebalancing portfolio to reduce exposure to high-risk assets.
        </p>
      </div>
    </motion.div>
  );
};

export default RiskGauge;