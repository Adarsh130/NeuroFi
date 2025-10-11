import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Candlestick Chart component with lightweight-charts fallback
 * @param {Object} props - Component props
 * @param {Array} props.data - Candlestick data array
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 * @param {Object} props.options - Chart configuration options
 * @param {Function} props.onCrosshairMove - Crosshair move callback
 * @returns {JSX.Element} CandlestickChart component
 */
const CandlestickChart = ({
  data = [],
  width = 800,
  height = 400,
  options = {},
  onCrosshairMove = null,
  showVolume = true,
  autoScale = true,
  timeFormat = 'HH:mm',
  ...props
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightweightChartsLoaded, setLightweightChartsLoaded] = useState(false);
  const { theme } = useTheme();

  // Dynamic import of lightweight-charts
  useEffect(() => {
    const loadLightweightCharts = async () => {
      try {
        const { createChart, ColorType } = await import('lightweight-charts');
        setLightweightChartsLoaded(true);
        return { createChart, ColorType };
      } catch (err) {
        console.warn('Lightweight charts not available, using fallback chart');
        setError(new Error('Chart library not available'));
        setIsLoading(false);
        return null;
      }
    };

    loadLightweightCharts();
  }, []);

  // Theme-aware chart options
  const getChartOptions = (ColorType) => {
    const isDark = theme === 'dark';
    
    return {
      layout: {
        background: { type: ColorType?.Solid || 0, color: 'transparent' },
        textColor: isDark ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { 
          color: isDark ? '#374151' : '#e5e7eb', 
          style: 1, 
          visible: true 
        },
        horzLines: { 
          color: isDark ? '#374151' : '#e5e7eb', 
          style: 1, 
          visible: true 
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#5C6BF3',
          width: 1,
          style: 2,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: '#5C6BF3',
          width: 1,
          style: 2,
          visible: true,
          labelVisible: true,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#485563' : '#d1d5db',
        textColor: isDark ? '#d1d5db' : '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.4 : 0.1,
        },
      },
      timeScale: {
        borderColor: isDark ? '#485563' : '#d1d5db',
        textColor: isDark ? '#d1d5db' : '#374151',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      ...options,
    };
  };

  // Initialize chart
  useEffect(() => {
    if (!lightweightChartsLoaded || !chartContainerRef.current) return;

    const initChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { createChart, ColorType } = await import('lightweight-charts');
        
        // Create chart
        const chart = createChart(chartContainerRef.current, {
          width,
          height,
          ...getChartOptions(ColorType),
        });

        chartRef.current = chart;

        // Create candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
          priceFormat: {
            type: 'price',
            precision: 8,
            minMove: 0.00000001,
          },
        });

        candlestickSeriesRef.current = candlestickSeries;

        // Create volume series if enabled
        if (showVolume) {
          const volumeSeries = chart.addHistogramSeries({
            color: '#5C6BF3',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: 'volume',
            scaleMargins: {
              top: 0.7,
              bottom: 0,
            },
          });

          volumeSeriesRef.current = volumeSeries;

          // Create separate price scale for volume
          chart.priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.7,
              bottom: 0,
            },
          });
        }

        // Add crosshair move handler
        if (onCrosshairMove) {
          chart.subscribeCrosshairMove(onCrosshairMove);
        }

        // Handle resize
        const handleResize = () => {
          if (chartRef.current && chartContainerRef.current) {
            const container = chartContainerRef.current;
            chartRef.current.applyOptions({
              width: container.clientWidth,
              height: container.clientHeight,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        setIsLoading(false);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            candlestickSeriesRef.current = null;
            volumeSeriesRef.current = null;
          }
        };
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    initChart();
  }, [lightweightChartsLoaded, width, height, showVolume, onCrosshairMove, theme]);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) return;

    try {
      // Transform data for lightweight-charts format
      const candlestickData = data.map(item => {
        // Handle different data formats
        const openTime = item.openTime || item.time || item.timestamp;
        const timeValue = typeof openTime === 'number' 
          ? Math.floor(openTime / 1000) 
          : Math.floor(new Date(openTime).getTime() / 1000);

        return {
          time: timeValue,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
        };
      }).filter(item => 
        !isNaN(item.time) && 
        !isNaN(item.open) && 
        !isNaN(item.high) && 
        !isNaN(item.low) && 
        !isNaN(item.close)
      );

      // Set candlestick data
      candlestickSeriesRef.current.setData(candlestickData);

      // Set volume data if volume series exists
      if (volumeSeriesRef.current && showVolume) {
        const volumeData = data.map(item => {
          const openTime = item.openTime || item.time || item.timestamp;
          const timeValue = typeof openTime === 'number' 
            ? Math.floor(openTime / 1000) 
            : Math.floor(new Date(openTime).getTime() / 1000);
          
          const volume = parseFloat(item.volume || 0);
          const open = parseFloat(item.open);
          const close = parseFloat(item.close);

          return {
            time: timeValue,
            value: volume,
            color: close >= open ? '#10b98150' : '#ef444450',
          };
        }).filter(item => !isNaN(item.time) && !isNaN(item.value));

        volumeSeriesRef.current.setData(volumeData);
      }

      // Auto-scale to fit content
      if (autoScale && chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (err) {
      setError(err);
    }
  }, [data, autoScale, showVolume]);

  // Update chart size
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({ width, height });
    }
  }, [width, height]);

  // Update chart theme
  useEffect(() => {
    if (chartRef.current && lightweightChartsLoaded) {
      import('lightweight-charts').then(({ ColorType }) => {
        chartRef.current.applyOptions(getChartOptions(ColorType));
      });
    }
  }, [theme, lightweightChartsLoaded]);

  // Fallback chart component
  const FallbackChart = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/20 dark:bg-slate-800/50 rounded-lg border border-slate-300 dark:border-slate-700">
      <BarChart3 className="h-16 w-16 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
        Chart Unavailable
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        The advanced chart library is not available. Please ensure all dependencies are installed.
      </p>
      {data.length > 0 && (
        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between mb-2">
              <span>Latest Price:</span>
              <span className="font-medium">${parseFloat(data[data.length - 1]?.close || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>24h High:</span>
              <span className="font-medium text-green-600">${Math.max(...data.map(d => parseFloat(d.high || 0))).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>24h Low:</span>
              <span className="font-medium text-red-600">${Math.min(...data.map(d => parseFloat(d.low || 0))).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (error && !lightweightChartsLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
        style={{ height }}
        {...props}
      >
        <FallbackChart />
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <div className="text-red-600 dark:text-red-400 mb-2">Chart Error</div>
          <div className="text-sm text-red-500 dark:text-red-300">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 z-10">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading chart...</span>
          </div>
        </div>
      )}
      
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: '100%', minHeight: height }}
        className="chart-container"
      />
      
      {/* Chart controls overlay */}
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
        <button
          onClick={() => {
            if (chartRef.current) {
              chartRef.current.timeScale().fitContent();
            }
          }}
          className="px-3 py-1 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600/80 text-slate-700 dark:text-white text-sm rounded border border-slate-200 dark:border-slate-600 transition-colors"
          title="Fit to content"
        >
          Fit
        </button>
        
        <button
          onClick={() => {
            if (chartRef.current) {
              chartRef.current.timeScale().resetTimeScale();
            }
          }}
          className="px-3 py-1 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600/80 text-slate-700 dark:text-white text-sm rounded border border-slate-200 dark:border-slate-600 transition-colors"
          title="Reset zoom"
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
};

export default CandlestickChart;