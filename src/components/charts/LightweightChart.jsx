// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    // Refs to hold instances of the chart, series, and container.
    // These will persist for the entire life of the component.
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLineRef = useRef(null); // A ref to specifically manage the price line

    // --- EFFECT 1: Handles the chart's lifecycle (creation and destruction) ---
    // This effect runs ONLY ONCE when the component first mounts.
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create the chart instance
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: { background: { color: '#1a1a3e' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            timeScale: { borderColor: 'rgba(255, 255, 255, 0.2)', timeVisible: true },
            crosshair: { mode: 'normal' },
        });

        // Create the series and store references in our refs
        const series = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
            borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
        });
        
        chartRef.current = chart;
        seriesRef.current = series;

        // Add a resize listener to keep the chart responsive
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function: This is called ONLY when the component is unmounted.
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []); // The empty dependency array [] is the key. It ensures this effect runs only once.

    // --- EFFECT 2: Handles updates to data and markers ---
    // This effect runs whenever ohlcData or signal changes.
    useEffect(() => {
        // Don't try to update if the chart/series isn't created yet or if there's no data.
        if (!seriesRef.current || !chartRef.current || !ohlcData || ohlcData.length === 0) {
            return;
        }
        
        // Update the data on the *existing* series.
        seriesRef.current.setData(ohlcData);

        // --- Clear previous markers and price line ---
        seriesRef.current.setMarkers([]);
        if (priceLineRef.current) {
            seriesRef.current.removePriceLine(priceLineRef.current);
            priceLineRef.current = null;
        }

        // --- Add new marker and price line if a signal is present ---
        if (signal) {
            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            const entryPrice = parseFloat(signal["Entry Price"]);

            seriesRef.current.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);

            const newPriceLine = seriesRef.current.createPriceLine({
                price: entryPrice, color: '#45b7d1', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: ' Entry',
            });
            priceLineRef.current = newPriceLine; // Store the new price line so we can remove it next time
        }

        // Fit the chart to the new data
        chartRef.current.timeScale().fitContent();

    }, [ohlcData, signal]); // This effect re-runs safely whenever the data changes.

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};