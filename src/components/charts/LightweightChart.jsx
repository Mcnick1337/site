// src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import * as LightweightCharts from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!ohlcData || ohlcData.length === 0 || !chartContainerRef.current) return;

        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: { background: { color: '#1a1a3e' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
            borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
        });

        candleSeries.setData(ohlcData);

        // Add signal marker
        const signalTime = new Date(signal.timestamp).getTime() / 1000;
        candleSeries.setMarkers([{
            time: signalTime,
            position: 'aboveBar',
            color: '#e91e63',
            shape: 'arrowDown',
            text: 'Signal'
        }]);

        // Add price lines
        const entryPrice = parseFloat(signal["Entry Price"]);
        candleSeries.createPriceLine({ price: entryPrice, color: '#45b7d1', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: ' Entry' });

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [ohlcData, signal]);

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};