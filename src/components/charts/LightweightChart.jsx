// File: src/components/charts/LightweightChart.jsx (Professional Redesign)

import { useEffect, useRef, useContext } from 'react';
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts';
import { ThemeContext } from '../../App'; 

// --- Professional Color Palette ---
const COLORS = {
    up: '#089981',      // A calming, professional green
    down: '#F23645',    // A clear, but not overly aggressive red
    upWick: '#089981',
    downWick: '#F23645',
    entry: '#1E88E5',   // A distinct blue for entry
    stopLoss: '#F23645',
    takeProfit: '#089981',
    signalMarker: '#FFC107', // Amber/gold for the signal marker
};

// --- Professional Theming ---
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
    const priceLinesRef = useRef([]);
    const { theme } = useContext(ThemeContext);

    // --- Chart Initialization Effect (runs once) ---
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            // --- ADDED: Kinetic scrolling for a smoother feel ---
            trackingMode: { exitMode: 'onTouchEnd' },
        });
        chartRef.current = chart;

        const series = chart.addCandlestickSeries({
            upColor: COLORS.up, downColor: COLORS.down,
            borderUpColor: COLORS.up, borderDownColor: COLORS.down,
            wickUpColor: COLORS.upWick, wickDownColor: COLORS.downWick,
        });
        seriesRef.current = series;
        
        chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });

        chart.subscribeCrosshairMove(param => {
            if (param.time && param.seriesData.has(series)) { onCrosshairMove(param.seriesData.get(series)); } 
            else { onCrosshairMove(null); }
        });

        const handleResize = () => { if (chartContainerRef.current && chartRef.current) { chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight); }};
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) { chartRef.current.remove(); }
        };
    }, [onCrosshairMove]);

    // --- Data & Theme Update Effect ---
    useEffect(() => {
        const chart = chartRef.current;
        const series = seriesRef.current;
        if (!chart || !series) return;

        // Apply theme first
        const currentTheme = theme === 'light' ? lightTheme : darkTheme;
        chart.applyOptions(currentTheme);
        
        // --- ADDED: More professional time formatting ---
        chart.timeScale().applyOptions({
            tickMarkFormatter: (time) => {
                const date = new Date(time * 1000);
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
            }
        });

        // Clear old data
        priceLinesRef.current.forEach(line => series.removePriceLine(line));
        priceLinesRef.current = [];
        series.setMarkers([]);

        if (ohlcData && ohlcData.length > 0) {
            series.setData(ohlcData);
            
            const addPriceLine = (value, title, color, lineStyle) => {
                const price = parseFloat(value);
                if (!isNaN(price)) {
                    const newLine = series.createPriceLine({
                        price, color, lineWidth: 2, lineStyle, axisLabelVisible: true, title,
                        // --- ADDED: Background for axis labels for clarity ---
                        axisLabelColor: '#FFFFFF',
                        axisLabelTextColor: color,
                    });
                    priceLinesRef.current.push(newLine);
                }
            };
            
            if (signal) {
                addPriceLine(signal["Entry Price"], 'ENTRY', COLORS.entry, LineStyle.Solid);
                if (signal["Take Profit Targets"]) {
                    addPriceLine(signal["Take Profit Targets"][0], 'TP 1', COLORS.takeProfit, LineStyle.Dashed);
                    addPriceLine(signal["Take Profit Targets"][1], 'TP 2', COLORS.takeProfit, LineStyle.Dashed);
                }
                addPriceLine(signal["Stop Loss"], 'SL', COLORS.stopLoss, LineStyle.Dashed);
                
                const signalTime = new Date(signal.timestamp).getTime() / 1000;
                series.setMarkers([{
                    time: signalTime, position: 'aboveBar', color: COLORS.signalMarker,
                    shape: 'circle', text: 'Signal',
                }]);
            }
            
            chart.timeScale().fitContent();
        } else {
            series.setData([]);
        }

        chart.applyOptions({
             watermark: {
                color: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                visible: true, text: signal.symbol.toUpperCase(), fontSize: 48,
                horzAlign: 'center', vertAlign: 'center',
            },
        });
    }, [ohlcData, signal, theme]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
};