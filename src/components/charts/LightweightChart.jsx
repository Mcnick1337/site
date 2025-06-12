// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
// CHANGE 1: We now import 'createChart' and 'LineStyle' directly.
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]);

    useEffect(() => {
        if (!ohlcData || ohlcData.length === 0) return;

        if (!chartRef.current) {
            const timer = setTimeout(() => {
                if (!chartContainerRef.current) return;

                // CHANGE 2: Call createChart() directly, without the "LightweightCharts." prefix.
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

                updateChartData();
            }, 0);

            return () => clearTimeout(timer);
        } else {
            updateChartData();
        }

        function updateChartData() {
            if (!seriesRef.current) return;
            seriesRef.current.setData(ohlcData);

            priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
            priceLinesRef.current = [];
            seriesRef.current.setMarkers([]);

            if (signal) {
                const signalTime = new Date(signal.timestamp).getTime() / 1000;
                const entryPrice = parseFloat(signal["Entry Price"]);

                seriesRef.current.setMarkers([{
                    time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
                }]);

                // CHANGE 3: Use 'LineStyle' directly.
                const entryPriceLine = seriesRef.current.createPriceLine({
                    price: entryPrice, color: '#45b7d1', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: ' Entry',
                });
                priceLinesRef.current.push(entryPriceLine);
            }
            chartRef.current.timeScale().fitContent();
        }
    }, [ohlcData, signal]);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
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

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};