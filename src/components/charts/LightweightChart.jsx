// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    // CHANGE: Use an array to hold all our price lines (Entry, TP, SL)
    const priceLinesRef = useRef([]);

    // This effect handles chart creation and destruction ONCE.
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
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

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []);

    // This effect handles all DATA and MARKER updates.
    useEffect(() => {
        if (!seriesRef.current || !chartRef.current || !ohlcData || ohlcData.length === 0) {
            return;
        }
        
        seriesRef.current.setData(ohlcData);
        seriesRef.current.setMarkers([]);

        // --- NEW: Improved cleanup logic for all price lines ---
        priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
        priceLinesRef.current = [];

        // --- NEW: Add all price lines if a signal is present ---
        if (signal) {
            const addPriceLine = (value, title, color, lineStyle) => {
                const price = parseFloat(value);
                // Important: Only draw the line if the price is a valid number
                if (!isNaN(price)) {
                    const newLine = seriesRef.current.createPriceLine({
                        price, color, lineWidth: 2, lineStyle, axisLabelVisible: true, title,
                    });
                    priceLinesRef.current.push(newLine); // Add to our array for future cleanup
                }
            };

            // Add Entry Price line (Solid Blue)
            addPriceLine(signal["Entry Price"], ' Entry', '#45b7d1', LineStyle.Solid);
            
            // Add TP1 line (Dashed Green)
            addPriceLine(signal["TP1"], ' TP1', '#26a69a', LineStyle.Dashed);
            
            // Add TP2 line if it exists (Dashed Green)
            if (signal["TP2"]) {
                addPriceLine(signal["TP2"], ' TP2', '#26a69a', LineStyle.Dashed);
            }
            
            // Add SL line (Dashed Red)
            addPriceLine(signal["SL"], ' SL', '#ef5350', LineStyle.Dashed);

            // Add the signal marker on the chart
            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            seriesRef.current.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);
        }

        chartRef.current.timeScale().fitContent();

    }, [ohlcData, signal]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};