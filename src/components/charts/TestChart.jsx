import React from 'react';
import CandlestickChart from './CandlestickChart';

/**
 * Test component for the CandlestickChart with sample data
 */
const TestChart = () => {
  // Generate sample candlestick data
  const generateSampleData = () => {
    const data = [];
    const startTime = Date.now() - (100 * 24 * 60 * 60 * 1000); // 100 days ago
    let price = 50000; // Starting price

    for (let i = 0; i < 100; i++) {
      const time = startTime + (i * 24 * 60 * 60 * 1000); // Daily intervals
      
      // Generate realistic price movements
      const change = (Math.random() - 0.5) * 0.1; // ±5% change
      const open = price;
      const close = price * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.05);
      const low = Math.min(open, close) * (1 - Math.random() * 0.05);
      const volume = Math.random() * 1000000 + 500000;

      data.push({
        openTime: time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(0))
      });

      price = close; // Update price for next iteration
    }

    return data;
  };

  const sampleData = generateSampleData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Chart Test
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Testing the CandlestickChart component with sample data
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Sample BTC/USDT Chart
        </h3>
        <CandlestickChart
          data={sampleData}
          width={800}
          height={400}
          showVolume={true}
          autoScale={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
            Chart Features
          </h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Real-time candlestick visualization</li>
            <li>• Volume histogram overlay</li>
            <li>• Interactive crosshair</li>
            <li>• Zoom and pan functionality</li>
            <li>• Theme-aware styling</li>
            <li>• Responsive design</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
            Data Stats
          </h4>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <div>Data Points: {sampleData.length}</div>
            <div>Latest Price: ${sampleData[sampleData.length - 1]?.close}</div>
            <div>Highest: ${Math.max(...sampleData.map(d => d.high)).toFixed(2)}</div>
            <div>Lowest: ${Math.min(...sampleData.map(d => d.low)).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChart;