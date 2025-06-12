// File: src/components/charts/LightweightChart.jsx (with EMA Overlay)

import { useEffect, useRef, useContext } from 'react';
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts';
import { ThemeContext } from '../../App'; 

// --- ADDED: Helper function to calculate the Exponential Moving Average ---
const calculateEMA = (data, period) => {
    if (!data || data.length < period) return [];

    // First, calculate the initial SMA for the first period
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    const sma = sum / period;

    const multiplier = 2 / (period + 1);
    const emaData = [];
    
    // Set the first EMA value to be the SMA
    emaData.push({ time: data[period - 1].time, value: sma });
    let previousEma = sma;

    // Calculate the rest of the EMA values
    for (let i = period; i < data.length; i++) {
        const ema = (data[i].close - previousEma) * multiplier + previousEma;
        emaData.push({ time: data[i].time, value: ema });
        previousEma = ema;
    }
    return emaData;
};

const COLORS = {
    up: '#089981', down: '#F23645', upWick: '#089981', downWick: '#F23645',
    entry: '#1E88E5', stopLoss: '#F23645', takeProfit: '#089981',
    signalMarker: '#FFC107',
    ema: '#FFD700', // --- ADDED: A distinct gold color for the EMA line ---
};

const darkTheme = {
    layout: { background: { color: 'transparent' }, textColor: '#D1D4DC', fontFamily: `'Inter', sans-serif` },
    grid: { vertLines: { color: 'rgba(255, 255, 255, 0.07)' }, horzLines: { color: 'rgba(255, 255, 255, 0.07)' } },
    crosshair: { mode: CrosshairMode.Normal, vertLine: { style: LineStyle.Solid, width: 1, color: 'rgba(209, 212, 220, 0.3)' }, horzLine: { style: LineStyle.Solid, width: 1, color: 'rgba(209, 212, 220, 0.3)' } },
    rightPriceScale: { borderColor: 'transparent' },
    timeScale: { borderColor: 'transparent', timeVisible: true, secondsVisible: false },
};

const lightTheme = {
    layout: { background: { color: 'transparent' }, textColor: '#131722', fontFamily: `'Inter', sans-serif` },
    grid: { vertLines: { color: 'rgba(0, 0, 0, 0.05)' }, horzLines: { color: 'rgba(0, 0, 0, 0.05)' } },
    crosshair: { mode: CrosshairMode.Normal, vertLine: { style: LineStyle.Solid, width: 1, color: 'rgba(19, 23, 34, 0.3)' }, horzLine: { style: LineStyle.Solid, width: 1, color: 'rgba(19, 23, 34, 0.3)' } },
    rightPriceScale: { borderColor: 'transparent' },
    timeScale: { borderColor: 'transparent', timeVisible: true, secondsVisible: false },
};

export const LightweightChart = ({ ohlcData, signal, onCrosshairMove }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    // --- ADDED: Ref to hold the new EMA series ---
    const emaSeriesRef = useRef(null);
    const priceLinesRef = useRef([]);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, { width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight, trackingMode: { exitMode: 'onTouchEnd' } });
        chartRef.current = chart;
        const series = chart.addCandlestickSeries({ upColor: COLORS.up, downColor: COLORS.down, borderUpColor: COLORS.up, borderDownColor: COLORS.down, wickUpColor: COLORS.upWick, wickDownColor: COLORS.downWick });
        seriesRef.current = series;
        
        // --- ADDED: Create the EMA line series on the main chart pane ---
        const emaSeries = chart.addLineSeries({
            color: COLORS.ema,
            lineWidth: 2,
            crosshairMarkerVisible: false, // Hide crosshair marker for a cleaner look
            lastValueVisible: false,      // Hide the axis label for the last value
            priceLineVisible: false,      // Hide the price line
        });
        emaSeriesRef.current = emaSeries;

        chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
        chart.subscribeCrosshairMove(param => {
            if (param.time && param.seriesData.has(series)) { onCrosshairMove(param.seriesData.get(series)); } 
            else { onCrosshairMove(null); }
        });
        const handleResize = () => { if (chartContainerRef.current && chartRef.current) { chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight); }};
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); if (chartRef.current) { chartRef.current.remove(); }};
    }, [onCrosshairMove]);

    useEffect(() => {
        const chart = chartRef.current;
        const series = seriesRef.current;
        if (!chart || !series) return;

        const currentTheme = theme === 'light' ? lightTheme : darkTheme;
        chart.applyOptions(currentTheme);
        chart.timeScale().applyOptions({ tickMarkFormatter: (time) => new Date(time * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) });

        priceLinesRef.current.forEach(line => series.removePriceLine(line));
        priceLinesRef.current = [];
        series.setMarkers([]);

        if (ohlcData && ohlcData.length > 0) {
            series.setData(ohlcData);

            // --- ADDED: Calculate and set the data for the EMA series ---
            if (emaSeriesRef.current) {
                const emaData = calculateEMA(ohlcData, 50);
                emaSeriesRef.current.setData(emaData);
            }
            
            const addPriceLine = (value, title, color, lineStyle) => { /* ... unchanged ... */ };
            if (signal) { /* ... unchanged ... */ }
            chart.timeScale().fitContent();
        } else {
            series.setData([]);
            // --- ADDED: Ensure the EMA line is also cleared when there's no data ---
            if (emaSeriesRef.current) {
                emaSeriesRef.current.setData([]);
            }
        }

        chart.applyOptions({ watermark: { color: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', visible: true, text: signal.symbol.toUpperCase(), fontSize: 48, horzAlign: 'center', vertAlign: 'center' } });
    }, [ohlcData, signal, theme]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
};