// File: src/components/charts/LightweightChart.jsx

import { useEffect, useRef } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';

export const LightweightChart = ({ ohlcData, signal }) => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        // Since the parent now waits for the animation to finish before rendering this component,
        // we can be confident that chartContainerRef.current is ready and has dimensions.
        if (!chartContainerRef.current || !ohlcData || ohlcData.length === 0) {
            return;
        }

        // Create the chart. This should now work reliably.
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

        series.setData(ohlcData);

        // Add signal marker and price line
        if (signal) {
            const signalTime = new Date(signal.timestamp).getTime() / 1000;
            const entryPrice = parseFloat(signal["Entry Price"]);

            series.setMarkers([{
                time: signalTime, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Signal',
            }]);

            series.createPriceLine({
                price: entryPrice, color: '#45b7d1', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: ' Entry',
            });
        }
        
        chart.timeScale().fitContent();

        // Make the chart responsive
        const handleResize = () => {
            // Check if the container is still there before resizing
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the chart and listener when the component unmounts or data changes
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };

    }, [ohlcData, signal]); // Re-run the effect if the signal or data changes.

    return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};