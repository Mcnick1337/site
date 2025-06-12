// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef, useContext } from 'react'; // Import useContext
import { createChart, LineStyle } from 'lightweight-charts';
import { ThemeContext } from '../App'; // Import our ThemeContext

// Define our two themes for the chart
const darkTheme = {
    layout: { background: { color: '#131722' }, textColor: '#D9D9D9', fontFamily: `'Trebuchet MS', 'Roboto', sans-serif` },
    grid: { vertLines: { color: '#1E222D' }, horzLines: { color: '#1E222D' } },
    crosshair: { mode: 'normal', vertLine: { style: LineStyle.Dashed, color: '#758696' }, horzLine: { style: LineStyle.Dashed, color: '#758696' } },
    rightPriceScale: { borderColor: '#1E222D' },
    timeScale: { borderColor: '#1E222D', timeVisible: true },
};

const lightTheme = {
    layout: { background: { color: '#FFFFFF' }, textColor: '#191919', fontFamily: `'Trebuchet MS', 'Roboto', sans-serif` },
    grid: { vertLines: { color: '#F0F3FA' }, horzLines: { color: '#F0F3FA' } },
    crosshair: { mode: 'normal', vertLine: { style: LineStyle.Dashed, color: '#758696' }, horzLine: { style: LineStyle.Dashed, color: '#758696' } },
    rightPriceScale: { borderColor: '#D1D4DC' },
    timeScale: { borderColor: '#D1D4DC', timeVisible: true },
};


export const LightweightChart = ({ ohlcData, signal, onCrosshairMove }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]);
    const { theme } = useContext(ThemeContext); // Get the current theme from context

    // Effect for chart creation and destruction
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current);
        chartRef.current = chart;

        const series = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
            borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
        });
        seriesRef.current = series;

        chart.subscribeCrosshairMove(param => {
            if (param.time && param.seriesData.has(series)) {
                onCrosshairMove(param.seriesData.get(series));
            } else {
                onCrosshairMove(null);
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
    }, [onCrosshairMove]);

    // Effect to apply theme and options when theme or signal changes
    useEffect(() => {
        if (!chartRef.current) return;

        const chartOptions = theme === 'light' ? lightTheme : darkTheme;
        chartRef.current.applyOptions({
            ...chartOptions,
            width: chartContainerRef.current.clientWidth,
            height: 300,
            watermark: {
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                visible: true, text: signal.symbol.toUpperCase(), fontSize: 48,
                horzAlign: 'center', vertAlign: 'center',
            },
        });
    }, [theme, signal.symbol]);

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
                prices.push(price);
                const newLine = seriesRef.current.createPriceLine({ price, color, lineWidth: 2, lineStyle, axisLabelVisible: true, title });
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
            seriesRef.current.setMarkers([{ time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal' }]);
        }

        if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const padding = (maxPrice - minPrice) * 0.2;
            seriesRef.current.priceScale().applyOptions({ autoScale: false, minValue: minPrice - padding, maxValue: maxPrice + padding });
        }
        
        chartRef.current.timeScale().fitContent();
    }, [ohlcData, signal]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};