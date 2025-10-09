import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import clsx from 'clsx';

/**
 * Real-time price ticker component
 * @param {Object} props - Component props
 * @param {Object} props.data - Ticker data from WebSocket
 * @param {string} props.symbol - Trading pair symbol
 * @param {boolean} props.showChange - Show price change
 * @param {boolean} props.showVolume - Show volume data
 * @param {string} props.size - Component size (sm, md, lg)
 * @returns {JSX.Element} PriceTicker component
 */
const PriceTicker = ({
  data,
  symbol,
  showChange = true,
  showVolume = true,
  size = 'md',
  className = '',
  ...props
}) => {
  if (!data) {
    return (
      <div className={clsx('animate-pulse bg-slate-800/50 rounded-lg p-4', className)}>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-20"></div>
          <div className="h-6 bg-slate-700 rounded w-32"></div>
          {showChange && <div className="h-4 bg-slate-700 rounded w-24"></div>}
        </div>
      </div>
    );
  }

  const {
    price,
    change,
    changePercent,
    volume,
    quoteVolume,
    high,
    low,
    timestamp
  } = data;

  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changeIcon = isPositive ? TrendingUp : TrendingDown;
  const ChangeIcon = changeIcon;

  const formatPrice = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const formatVolume = (value) => {
    if (!value) return '0';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const formatPercent = (value) => {
    if (!value) return '0.00%';
    return `${isPositive ? '+' : ''}${parseFloat(value).toFixed(2)}%`;
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      symbol: 'text-sm font-medium',
      price: 'text-lg font-bold',
      change: 'text-xs',
      volume: 'text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'p-4',
      symbol: 'text-base font-medium',
      price: 'text-xl font-bold',
      change: 'text-sm',
      volume: 'text-sm',
      icon: 'h-4 w-4'
    },
    lg: {
      container: 'p-6',
      symbol: 'text-lg font-medium',
      price: 'text-2xl font-bold',
      change: 'text-base',
      volume: 'text-base',
      icon: 'h-5 w-5'
    }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg',
        'hover:border-slate-600 transition-all duration-200',
        classes.container,
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={clsx('text-white', classes.symbol)}>
            {symbol}
          </span>
          <div className="flex items-center space-x-1">
            <Activity className={clsx('text-primary animate-pulse', classes.icon)} />
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
        </div>
        
        {timestamp && (
          <span className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-3">
        <motion.div
          key={price}
          initial={{ scale: 1.05, color: isPositive ? '#10b981' : '#ef4444' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className={clsx('text-white', classes.price)}
        >
          ${formatPrice(price)}
        </motion.div>
      </div>

      {/* Change and Volume */}
      <div className="space-y-2">
        {showChange && (
          <div className="flex items-center justify-between">
            <div className={clsx('flex items-center space-x-1', changeColor)}>
              <ChangeIcon className={classes.icon} />
              <span className={classes.change}>
                {formatPercent(changePercent)}
              </span>
            </div>
            
            <div className={clsx('text-right', changeColor, classes.change)}>
              {isPositive ? '+' : ''}${formatPrice(Math.abs(change))}
            </div>
          </div>
        )}

        {showVolume && volume && (
          <div className="flex items-center justify-between text-gray-400">
            <span className={classes.volume}>Volume</span>
            <span className={classes.volume}>{formatVolume(volume)}</span>
          </div>
        )}

        {/* High/Low */}
        {high && low && (
          <div className="flex items-center justify-between text-gray-400">
            <div className={clsx('flex space-x-2', classes.volume)}>
              <span>H: ${formatPrice(high)}</span>
              <span>L: ${formatPrice(low)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Connection indicator */}
      <div className="absolute top-2 right-2">
        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );
};

/**
 * Multiple price tickers in a grid layout
 */
export const PriceTickerGrid = ({ 
  symbols = [], 
  data = {}, 
  columns = 3,
  size = 'sm',
  className = '' 
}) => {
  return (
    <div className={clsx(
      'grid gap-4',
      {
        'grid-cols-1': columns === 1,
        'grid-cols-2': columns === 2,
        'grid-cols-3': columns === 3,
        'grid-cols-4': columns === 4,
        'grid-cols-5': columns === 5,
        'grid-cols-6': columns === 6,
      },
      className
    )}>
      {symbols.map(symbol => (
        <PriceTicker
          key={symbol}
          symbol={symbol}
          data={data[symbol]}
          size={size}
        />
      ))}
    </div>
  );
};

/**
 * Compact horizontal price ticker
 */
export const CompactPriceTicker = ({ data, symbol, className = '' }) => {
  if (!data) return null;

  const { price, changePercent } = data;
  const isPositive = changePercent >= 0;

  const formatPrice = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  return (
    <div className={clsx(
      'flex items-center space-x-3 px-3 py-2 bg-slate-800/30 rounded-lg border border-slate-700',
      className
    )}>
      <span className="text-sm font-medium text-white">{symbol}</span>
      <span className="text-sm font-bold text-white">${formatPrice(price)}</span>
      <span className={clsx(
        'text-xs font-medium',
        isPositive ? 'text-green-400' : 'text-red-400'
      )}>
        {isPositive ? '+' : ''}{parseFloat(changePercent).toFixed(2)}%
      </span>
    </div>
  );
};

export default PriceTicker;