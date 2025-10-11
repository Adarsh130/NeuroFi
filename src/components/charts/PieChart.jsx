import React from 'react';
import { motion } from 'framer-motion';

/**
 * Simple SVG Pie Chart component as a replacement for recharts
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data with name, value, and color
 * @param {number} props.size - Size of the chart
 * @param {number} props.innerRadius - Inner radius for donut chart
 * @returns {JSX.Element} PieChart component
 */
const PieChart = ({ 
  data = [], 
  size = 200, 
  innerRadius = 0,
  showTooltip = true 
}) => {
  const radius = size / 2 - 10;
  const center = size / 2;
  
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles for each slice
  let currentAngle = 0;
  const slices = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    
    return {
      ...item,
      startAngle,
      endAngle,
      angle
    };
  });
  
  // Convert angle to radians
  const toRadians = (angle) => (angle * Math.PI) / 180;
  
  // Create SVG path for pie slice
  const createPath = (startAngle, endAngle, outerRadius, innerRadius = 0) => {
    const startAngleRad = toRadians(startAngle - 90);
    const endAngleRad = toRadians(endAngle - 90);
    
    const x1 = center + outerRadius * Math.cos(startAngleRad);
    const y1 = center + outerRadius * Math.sin(startAngleRad);
    const x2 = center + outerRadius * Math.cos(endAngleRad);
    const y2 = center + outerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    if (innerRadius > 0) {
      // Donut chart
      const x3 = center + innerRadius * Math.cos(endAngleRad);
      const y3 = center + innerRadius * Math.sin(endAngleRad);
      const x4 = center + innerRadius * Math.cos(startAngleRad);
      const y4 = center + innerRadius * Math.sin(startAngleRad);
      
      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    } else {
      // Regular pie chart
      return `M ${center} ${center} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }
  };
  
  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="overflow-visible">
        {slices.map((slice, index) => (
          <motion.path
            key={slice.name}
            d={createPath(slice.startAngle, slice.endAngle, radius, innerRadius)}
            fill={slice.color}
            stroke="#1e293b"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            style={{ transformOrigin: `${center}px ${center}px` }}
          />
        ))}
      </svg>
      
      {/* Center text for donut chart */}
      {innerRadius > 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center text-center"
          style={{ 
            top: center - 20, 
            left: center - 40, 
            width: 80, 
            height: 40 
          }}
        >
          <div className="text-white font-semibold">
            <div className="text-lg">{total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;