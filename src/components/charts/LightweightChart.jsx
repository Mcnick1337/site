// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]);

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
    }, [signal.symbol]);

    useEffect(() => {
        if (!seriesRef.current || !chartRef.current || !ohlcData || ohlcData.length === 0) return;
        
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

            // --- CHANGES START HERE ---
            addPriceLine(signal["Entry Price"], ' Entry', '#45b7d1', LineStyle.Solid);
            
            // Access the Take Profit array
            if (signal["Take Profit Targets"] && signal["Take Profit Targets"][0]) {
                addPriceLine(signal["Take Profit Targets"][0], ' TP1', '#26a69a', LineStyle.Dashed);
            }
            if (signal["Take Profit Targets"] && signal["Take Profit Targets"][1]) {
                addPriceLine(signal["Take Profit Targets"][1], ' TP2', '#26a69a', LineStyle.Dashed);
            }
            
            // Access Stop Loss with a space in the name
            addPriceLine(signal["Stop Loss"], ' SL', '#ef5350', LineStyle.Dashed);
            // --- CHANGES END HERE ---

            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            seriesRef.current.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);
        }

        chartRef.current.timeScale().fitContent();
    }, [ohlcData, signal]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};