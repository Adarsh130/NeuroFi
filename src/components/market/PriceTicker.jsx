import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Volume2 } from 'lucide-react';
import clsx from 'clsx';

const PriceTicker = ({ 
  symbol, 
  data, 
  size = 'md', 
  showVolume = false, 
  className = '' 
}) => {
  const [prevPrice, setPrevPrice] = useState(null);
  const [priceDirection, setPriceDirection] = useState(null);

  // Track price changes for animation
  useEffect(() => {
    if (data?.price && prevPrice !== null) {
      if (data.price > prevPrice) {
        setPriceDirection('up');
      } else if (data.price < prevPrice) {
        setPriceDirection('down');
      }
      
      // Clear direction after animation
      const timer = setTimeout(() => setPriceDirection(null), 1000);
      return () => clearTimeout(timer);
    }
    
    if (data?.price) {
      setPrevPrice(data.price);
    }
  }, [data?.price, prevPrice]);

  // Format large numbers
  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  // Format price based on symbol
  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          price: 'text-xl',
          change: 'text-sm',
          label: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-6',
          price: 'text-3xl',
          change: 'text-lg',
          label: 'text-sm'
        };
      default:
        return {
          container: 'p-5',
          price: 'text-2xl',
          change: 'text-base',
          label: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const isPositive = data?.changePercent >= 0;
  const cryptoName = symbol?.replace('USDT', '') || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl',
        sizeClasses.container,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {cryptoName.slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{cryptoName}</h3>
            <p className={clsx('text-gray-400', sizeClasses.label)}>
              {symbol}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={clsx(
            'h-2 w-2 rounded-full',
            data ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          )}></div>
          <span className={clsx('text-gray-400', sizeClasses.label)}>
            {data ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <motion.div
          animate={{
            color: priceDirection === 'up' ? '#10B981' : 
                   priceDirection === 'down' ? '#EF4444' : '#FFFFFF'
          }}
          transition={{ duration: 0.3 }}
          className={clsx('font-bold', sizeClasses.price)}
        >
          ${formatPrice(data?.price)}
        </motion.div>
        
        {data?.change !== undefined && (
          <div className={clsx(
            'flex items-center space-x-1 mt-1',
            isPositive ? 'text-green-400' : 'text-red-400',
            sizeClasses.change
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? '+' : ''}{data.change?.toFixed(2)} 
              ({isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-400 mb-1">24h High</div>
          <div className="text-green-400 font-medium">
            ${formatPrice(data?.high)}
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">24h Low</div>
          <div className="text-red-400 font-medium">
            ${formatPrice(data?.low)}
          </div>
        </div>
      </div>

      {/* Volume (if enabled) */}
      {showVolume && data?.volume && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400">
              <Volume2 className="h-4 w-4" />
              <span className={sizeClasses.label}>24h Volume</span>
            </div>
            <div className="text-white font-medium">
              {formatVolume(data.volume)}
            </div>
          </div>
          {data?.quoteVolume && (
            <div className="flex items-center justify-between mt-2">
              <span className={clsx('text-gray-400', sizeClasses.label)}>
                Quote Volume
              </span>
              <span className="text-gray-300">
                ${formatVolume(data.quoteVolume)}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Compact version of PriceTicker for smaller spaces
export const CompactPriceTicker = ({ symbol, data, className = '' }) => {
  const isPositive = data?.changePercent >= 0;
  const cryptoName = symbol?.replace('USDT', '') || 'Unknown';

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div className={clsx(
      'flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700',
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {cryptoName.slice(0, 2)}
          </span>
        </div>
        <div>
          <div className="text-white font-medium text-sm">{cryptoName}</div>
          <div className="text-gray-400 text-xs">{symbol}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-white font-semibold">
          ${formatPrice(data?.price)}
        </div>
        {data?.changePercent !== undefined && (
          <div className={clsx(
            'text-xs flex items-center justify-end space-x-1',
            isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Grid component to display multiple price tickers
export const PriceTickerGrid = ({ 
  symbols = [], 
  data = {}, 
  columns = 3, 
  size = 'md',
  showVolume = false,
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={clsx(
      'grid gap-4',
      gridCols[columns] || gridCols[3],
      className
    )}>
      {symbols.map((symbol) => (
        <PriceTicker
          key={symbol}
          symbol={symbol}
          data={data[symbol]}
          size={size}
          showVolume={showVolume}
        />
      ))}
    </div>
  );
};

export default PriceTicker;