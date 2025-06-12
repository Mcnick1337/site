// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import * as LightweightCharts from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    // Refs to hold the chart, series, and container instances.
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]); // A ref to keep track of price lines for easy removal

    // This effect runs whenever the data or signal changes.
    useEffect(() => {
        // If there's no data, we can't do anything.
        if (!ohlcData || ohlcData.length === 0) {
            return;
        }

        // --- Chart Initialization ---
        // If the chart hasn't been created yet, create it.
        // This is where the main fix is applied.
        if (!chartRef.current) {
            // THE FIX: Delay chart creation to the next browser tick.
            // This ensures the container div is fully rendered and ready.
            const timer = setTimeout(() => {
                // Double-check that the container still exists when the timeout runs.
                if (!chartContainerRef.current) return;

                const chart = LightweightCharts.createChart(chartContainerRef.current, {
                    width: chartContainerRef.current.clientWidth,
                    height: 300,
                    layout: { background: { color: '#1a1a3e' }, textColor: '#d1d4dc' },
                    grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
                    timeScale: { borderColor: 'rgba(255, 255, 255, 0.2)', timeVisible: true },
                    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
                });

                const series = chart.addCandlestickSeries({
                    upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
                    borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
                });

                chartRef.current = chart;
                seriesRef.current = series;

                // Now that the chart is created, update it with the data
                updateChartData();

            }, 0); // A timeout of 0ms is all that's needed.

            return () => clearTimeout(timer); // Clean up the timer if the component unmounts quickly
        }
        else {
            // If the chart already exists, just update it directly.
            updateChartData();
        }

        // --- Chart Update Function ---
        const updateChartData = () => {
            if (!seriesRef.current) return;

            // Update the candlestick data
            seriesRef.current.setData(ohlcData);

            // Clear any old price lines and markers
            priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
            priceLinesRef.current = [];
            seriesRef.current.setMarkers([]);

            // Add new ones if a signal is present
            if (signal) {
                const signalTime = new Date(signal.timestamp).getTime() / 1000;
                const entryPrice = parseFloat(signal["Entry Price"]);

                seriesRef.current.setMarkers([{
                    time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
                }]);

                const entryPriceLine = seriesRef.current.createPriceLine({
                    price: entryPrice, color: '#45b7d1', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: ' Entry',
                });
                priceLinesRef.current.push(entryPriceLine);
            }
            chartRef.current.timeScale().fitContent();
        };

    }, [ohlcData, signal]);

    // This separate effect handles the final cleanup when the component unmounts
    useEffect(() => {
        const chart = chartRef.current;
        const handleResize = () => {
            if (chart) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart) {
                chart.remove();
            }
        };
    }, []);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};