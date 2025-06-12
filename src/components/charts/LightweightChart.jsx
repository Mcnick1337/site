// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal, onCrosshairMove }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]);

    // Effect for chart creation and destruction
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chartOptions = {
            layout: {
                background: { color: '#131722' }, textColor: '#D9D9D9',
                fontFamily: `'Trebuchet MS', 'Roboto', sans-serif`,
            },
            grid: { vertLines: { color: '#1E222D' }, horzLines: { color: '#1E222D' } },
            crosshair: {
                mode: 'normal', vertLine: { style: LineStyle.Dashed, color: '#758696' },
                horzLine: { style: LineStyle.Dashed, color: '#758696' },
            },
            rightPriceScale: { borderColor: '#1E222D' }, timeScale: { borderColor: '#1E222D', timeVisible: true },
            watermark: {
                color: 'rgba(255, 255, 255, 0.04)', visible: true, text: signal.symbol.toUpperCase(),
                fontSize: 48, horzAlign: 'center', vertAlign: 'center',
            },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: 300 });

        const series = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
            borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
        });

        chartRef.current = chart;
        seriesRef.current = series;

        // Subscribe to crosshair movement
        chart.subscribeCrosshairMove(param => {
            if (param.time && param.seriesData.has(series)) {
                onCrosshairMove(param.seriesData.get(series));
            } else {
                onCrosshairMove(null); // Clear data when crosshair is off the chart
            }
        });

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
    }, [signal.symbol, onCrosshairMove]); // Re-run if symbol or callback changes

    // Effect for data and marker updates
    useEffect(() => {
        if (!seriesRef.current || !chartRef.current || !ohlcData || ohlcData.length === 0) return;
        
        seriesRef.current.setData(ohlcData);
        priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
        priceLinesRef.current = [];
        seriesRef.current.setMarkers([]);

        const prices = [];
        const addPriceLine = (value, title, color, lineStyle) => {
            const price = parseFloat(value);
            if (!isNaN(price)) {
                prices.push(price); // Collect prices for auto-scaling
                const newLine = seriesRef.current.createPriceLine({
                    price, color, lineWidth: 2, lineStyle, axisLabelVisible: true, title,
                });
                priceLinesRef.current.push(newLine);
            }
        };

        if (signal) {
            addPriceLine(signal["Entry Price"], ' Entry', '#45b7d1', LineStyle.Solid);
            if (signal["Take Profit Targets"]) {
                addPriceLine(signal["Take Profit Targets"][0], ' TP1', '#26a69a', LineStyle.Dashed);
                addPriceLine(signal["Take Profit Targets"][1], ' TP2', '#26a69a', LineStyle.Dashed);
            }
            addPriceLine(signal["Stop Loss"], ' SL', '#ef5350', LineStyle.Dashed);
            
            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            seriesRef.current.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);
        }

        // Auto-adjust price range based on TP/SL levels
        if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const padding = (maxPrice - minPrice) * 0.2; // 20% vertical padding
            seriesRef.current.priceScale().applyOptions({
                autoScale: false, // Turn off default autoScale
                minValue: minPrice - padding,
                maxValue: maxPrice + padding,
            });
        }
        
        chartRef.current.timeScale().fitContent();

    }, [ohlcData, signal]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};