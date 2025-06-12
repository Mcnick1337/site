// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    // Refs to hold instances that persist for the lifetime of the component
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLineRef = useRef(null);

    // This effect handles chart creation and destruction ONCE.
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create the chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: { background: { color: '#1a1a3e' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            timeScale: { borderColor: 'rgba(255, 255, 255, 0.2)', timeVisible: true },
            crosshair: { mode: 'normal' },
        });

        // Add the series
        const series = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
            borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
        });

        // Store instances in refs
        chartRef.current = chart;
        seriesRef.current = series;

        // Add a resize listener
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []); // Empty array ensures this runs only ONCE.

    // This effect handles all DATA and MARKER updates.
    useEffect(() => {
        // Guard against running before the chart is ready
        if (!seriesRef.current || !chartRef.current || !ohlcData || ohlcData.length === 0) {
            return;
        }
        
        // Update the data on the existing series
        seriesRef.current.setData(ohlcData);

        // Clear old markers and price lines
        seriesRef.current.setMarkers([]);
        if (priceLineRef.current) {
            seriesRef.current.removePriceLine(priceLineRef.current);
            priceLineRef.current = null;
        }

        // Add new marker and price line
        if (signal) {
            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            const entryPrice = parseFloat(signal["Entry Price"]);

            seriesRef.current.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);

            const newPriceLine = seriesRef.current.createPriceLine({
                price: entryPrice, color: '#45b7d1', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: ' Entry',
            });
            priceLineRef.current = newPriceLine;
        }

        // Fit the chart to the data
        chartRef.current.timeScale().fitContent();

    }, [ohlcData, signal]); // Re-runs when data changes.

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};