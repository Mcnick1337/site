// File: src/pages/Home.jsx

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

// --- ChartComponent START ---
const ChartComponent = ({ data }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    // If the container div isn't ready, don't do anything. This is the fix.
    if (!chartContainerRef.current) {
      return;
    }

    // If the chart doesn't exist, create it and the series.
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
      });
    }

    // Every time the data prop changes, update the chart's data.
    seriesRef.current.setData(data);
    chartRef.current.timeScale().fitContent();

    // This cleanup function is crucial. It removes the chart when the component is unmounted.
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]); // The effect re-runs whenever 'data' changes.

  return <div ref={chartContainerRef} className="chart-container w-full" />;
};
// --- ChartComponent END ---


// --- DUMMY DATA SIMULATION ---
// This simulates fetching different sets of data for your signals.
function generateCandlestickData(count, startPrice) {
  const data = [];
  let time = Math.floor(new Date().getTime() / 1000); // Unix timestamp
  let price = startPrice;
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = open + (Math.random() - 0.5) * 5;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    data.push({ time, open, high, low, close });
    time += 86400; // Go to the next day
    price = close;
  }
  return data.reverse(); // Charts typically expect data from oldest to newest
}

const signals = [
  { id: 1, name: 'Signal Alpha', data: generateCandlestickData(100, 150) },
  { id: 2, name: 'Signal Beta', data: generateCandlestickData(100, 160) },
  { id: 3, name: 'Signal Gamma', data: generateCandlestickData(100, 140) },
];
// --- END DUMMY DATA ---


function Home() {
  const [activeSignalData, setActiveSignalData] = useState(signals[0].data);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Signal Catalog</h1>
      
      {/* Signal Selection UI */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Select a Signal to View</h2>
        <div className="flex space-x-2">
          {signals.map(signal => (
            <button
              key={signal.id}
              onClick={() => setActiveSignalData(signal.data)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {signal.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="bg-white p-4 rounded-lg shadow">
        {/* The ChartComponent will be rendered here */}
        <ChartComponent data={activeSignalData} />
      </div>
    </div>
  );
}

export default Home;