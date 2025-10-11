import React from 'react';
import { motion } from 'framer-motion';

/**
 * Simple SVG Line Chart component as a replacement for recharts
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data
 * @param {string} props.xKey - Key for x-axis data
 * @param {string} props.yKey - Key for y-axis data
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 * @param {string} props.color - Line color
 * @returns {JSX.Element} LineChart component
 */
const LineChart = ({ 
  data = [], 
  xKey = 'x', 
  yKey = 'y',
  width = 400,
  height = 200,
  color = '#5C6BF3',
  showGrid = true,
  showDots = true
}) => {
  if (!data.length) return null;
  
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Find min and max values
  const yValues = data.map(d => d[yKey]);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yRange = maxY - minY || 1;
  
  // Create points for the line
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d[yKey] - minY) / yRange) * chartHeight;
    return { x, y, data: d };
  });
  
  // Create path string
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');
  
  // Create area path for gradient fill
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + ratio * chartHeight;
              return (
                <line
                  key={`h-${index}`}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#64748b"
                  strokeWidth="1"
                />
              );
            })}
            {/* Vertical grid lines */}
            {data.map((_, index) => {
              if (index % Math.ceil(data.length / 5) === 0) {
                const x = padding + (index / (data.length - 1)) * chartWidth;
                return (
                  <line
                    key={`v-${index}`}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}
          </g>
        )}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#lineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Main line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Data points */}
        {showDots && points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            stroke="#1e293b"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="hover:r-6 transition-all cursor-pointer"
          />
        ))}
        
        {/* Y-axis labels */}
        {[minY, (minY + maxY) / 2, maxY].map((value, index) => {
          const y = padding + (2 - index) * (chartHeight / 2);
          return (
            <text
              key={index}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-400"
            >
              {value.toFixed(0)}
            </text>
          );
        })}
        
        {/* X-axis labels */}
        {data.map((d, index) => {
          if (index % Math.ceil(data.length / 4) === 0) {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {d[xKey]}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export default LineChart;