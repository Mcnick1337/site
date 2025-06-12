// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import * as LightweightCharts from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    // Create refs to hold the chart and series instances. These will persist across re-renders.
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]); // A ref to keep track of price lines for easy removal

    // This effect runs only ONCE when the component mounts to create the chart
    useEffect(() => {
        // If the chart instance already exists, do nothing.
        if (chartRef.current) return;

        // Create the chart
        chartRef.current = LightweightCharts.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: { background: { color: '#1a1a3e' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                timeVisible: true,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
        });

        // Create the series and store it in a ref
        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
            borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
        });

        // Add a resize listener to make the chart responsive
        const handleResize = () => {
            if (chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // The cleanup function: this is called when the component is unmounted
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []); // The empty array [] ensures this effect runs only once

    // This effect runs whenever the data changes to UPDATE the chart
    useEffect(() => {
        // If the series isn't ready yet, or there's no data, do nothing
        if (!seriesRef.current || !ohlcData || ohlcData.length === 0) {
            return;
        }

        // Update the candlestick data
        seriesRef.current.setData(ohlcData);

        // --- Update Markers and Price Lines ---
        // 1. Clear any old price lines and markers
        priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
        priceLinesRef.current = [];
        seriesRef.current.setMarkers([]);

        // 2. Add new ones if a signal is present
        if (signal) {
            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            const entryPrice = parseFloat(signal["Entry Price"]);

            // Add the signal marker
            seriesRef.current.setMarkers([{
                time: signalTime,
                position: 'aboveBar',
                color: '#e91e63',
                shape: 'arrowDown',
                text: 'Signal',
            }]);

            // Create the price line and store its reference so we can remove it later
            const entryPriceLine = seriesRef.current.createPriceLine({
                price: entryPrice,
                color: '#45b7d1',
                lineWidth: 2,
                lineStyle: LightweightCharts.LineStyle.Solid,
                axisLabelVisible: true,
                title: ' Entry',
            });
            priceLinesRef.current.push(entryPriceLine);
        }

        // Adjust the visible range to fit the new data
        chartRef.current.timeScale().fitContent();

    }, [ohlcData, signal]); // This effect re-runs whenever the data or signal changes

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};