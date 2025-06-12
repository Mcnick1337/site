// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLineRef = useRef(null);

    // This effect handles the creation and destruction of the chart.
    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        // Use ResizeObserver to reliably wait for the container to have a size.
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            
            // Only create the chart if it has a valid size AND it hasn't been created yet.
            if (width > 0 && height > 0 && !chartRef.current) {
                const chart = createChart(container, {
                    width, height,
                    layout: { background: { color: '#1a1a3e' }, textColor: '#d1d4dc' },
                    grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
                    timeScale: { borderColor: 'rgba(255, 255, 255, 0.2)', timeVisible: true },
                    crosshair: { mode: 'normal' },
                });

                const series = chart.addCandlestickSeries({
                    upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
                    borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
                });

                chartRef.current = chart;
                seriesRef.current = series;
                
                // Once created, we don't need the observer anymore.
                resizeObserver.disconnect();
            }
        });

        resizeObserver.observe(container);

        // Cleanup function for when the component unmounts
        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []); // Runs only on mount.

    // This effect handles all data updates.
    useEffect(() => {
        if (!seriesRef.current || !ohlcData || ohlcData.length === 0) return;

        seriesRef.current.setData(ohlcData);
        
        seriesRef.current.setMarkers([]);
        if (priceLineRef.current) {
            seriesRef.current.removePriceLine(priceLineRef.current);
            priceLineRef.current = null;
        }

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

        chartRef.current.timeScale().fitContent();
    }, [ohlcData, signal]); // Re-runs when data changes.

    // This effect handles window resizing to keep the chart responsive.
    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};