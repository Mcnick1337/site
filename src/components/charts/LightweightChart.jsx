// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]);

    // This effect handles chart creation and destruction ONCE.
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // --- NEW: Professional "TradingView" Theme Options ---
        const chartOptions = {
            layout: {
                background: { color: '#131722' }, // Bybit's dark background
                textColor: '#D9D9D9', // Light gray text
                fontFamily: `'Trebuchet MS', 'Roboto', sans-serif`,
            },
            grid: {
                vertLines: { color: '#1E222D' }, // Subtle vertical grid lines
                horzLines: { color: '#1E222D' }, // Subtle horizontal grid lines
            },
            crosshair: {
                mode: 'normal',
                vertLine: { style: LineStyle.Dashed, color: '#758696' },
                horzLine: { style: LineStyle.Dashed, color: '#758696' },
            },
            rightPriceScale: {
                borderColor: '#1E222D', // Border to match the grid
            },
            timeScale: {
                borderColor: '#1E222D', // Border to match the grid
                timeVisible: true,
            },
            // The iconic background watermark
            watermark: {
                color: 'rgba(255, 255, 255, 0.04)', // Very faint
                visible: true,
                text: signal.symbol.toUpperCase(), // Dynamic symbol text
                fontSize: 48,
                horzAlign: 'center',
                vertAlign: 'center',
            },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        
        // We keep the width and height separate as they depend on the container size
        chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: 300
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
    }, [signal.symbol]); // IMPORTANT: Re-create chart if the symbol changes to update watermark

    // This effect handles all DATA and MARKER updates.
    useEffect(() => {
        if (!seriesRef.current || !chartRef.current || !ohlcData || ohlcData.length === 0) {
            return;
        }
        
        seriesRef.current.setData(ohlcData);
        seriesRef.current.setMarkers([]);
        
        priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
        priceLinesRef.current = [];

        if (signal) {
            const addPriceLine = (value, title, color, lineStyle) => {
                const price = parseFloat(value);
                if (!isNaN(price)) {
                    const newLine = seriesRef.current.createPriceLine({
                        price, color, lineWidth: 2, lineStyle, axisLabelVisible: true, title,
                    });
                    priceLinesRef.current.push(newLine);
                }
            };

            addPriceLine(signal["Entry Price"], ' Entry', '#45b7d1', LineStyle.Solid);
            addPriceLine(signal["TP1"], ' TP1', '#26a69a', LineStyle.Dashed);
            if (signal["TP2"]) {
                addPriceLine(signal["TP2"], ' TP2', '#26a69a', LineStyle.Dashed);
            }
            addPriceLine(signal["SL"], ' SL', '#ef5350', LineStyle.Dashed);

            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            seriesRef.current.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);
        }

        chartRef.current.timeScale().fitContent();

    }, [ohlcData, signal]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};