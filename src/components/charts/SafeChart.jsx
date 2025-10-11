import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Safe Chart component that prevents SVG path errors
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data array
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 * @returns {JSX.Element} SafeChart component
 */
const SafeChart = ({ 
  data = [], 
  width = 400, 
  height = 200, 
  type = 'line',
  color = '#5C6BF3',
  ...props 
}) => {
  // Validate and sanitize data
  const safeData = data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    
    const value = parseFloat(item.value || item.y || item.price || 0);
    const time = item.time || item.x || item.timestamp;
    
    return !isNaN(value) && value !== null && value !== undefined && time;
  }).map(item => ({
    value: parseFloat(item.value || item.y || item.price || 0),
    time: item.time || item.x || item.timestamp,
    label: item.label || item.name || ''
  }));

  // If no valid data, show placeholder
  if (safeData.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-slate-800/20 rounded-lg border border-slate-700"
        style={{ width, height }}
        {...props}
      >
        <BarChart3 className="h-12 w-12 text-slate-400 mb-2" />
        <p className="text-slate-400 text-sm">No chart data available</p>
      </div>
    );
  }

  // Calculate safe bounds
  const values = safeData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Prevent division by zero

  // Generate safe SVG path
  const generateSafePath = () => {
    if (safeData.length < 2) return '';

    const padding = 20;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    const points = safeData.map((item, index) => {
      const x = padding + (index / (safeData.length - 1)) * chartWidth;
      const y = padding + ((maxValue - item.value) / valueRange) * chartHeight;
      
      // Ensure coordinates are valid numbers
      const safeX = isNaN(x) ? padding : Math.max(padding, Math.min(width - padding, x));
      const safeY = isNaN(y) ? height / 2 : Math.max(padding, Math.min(height - padding, y));
      
      return `${safeX},${safeY}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const pathData = generateSafePath();

  return (
    <div className="relative" style={{ width, height }} {...props}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chart path */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {/* Data points */}
        {safeData.map((item, index) => {
          const padding = 20;
          const chartWidth = width - (padding * 2);
          const chartHeight = height - (padding * 2);
          
          const x = padding + (index / (safeData.length - 1)) * chartWidth;
          const y = padding + ((maxValue - item.value) / valueRange) * chartHeight;
          
          // Ensure coordinates are valid
          const safeX = isNaN(x) ? padding : Math.max(padding, Math.min(width - padding, x));
          const safeY = isNaN(y) ? height / 2 : Math.max(padding, Math.min(height - padding, y));
          
          return (
            <circle
              key={index}
              cx={safeX}
              cy={safeY}
              r="3"
              fill={color}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          );
        })}
      </svg>
      
      {/* Value labels */}
      <div className="absolute top-2 left-2 text-xs text-slate-400">
        {maxValue.toFixed(2)}
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-slate-400">
        {minValue.toFixed(2)}
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-slate-400">
        {safeData.length} points
      </div>
    </div>
  );
};

export default SafeChart;