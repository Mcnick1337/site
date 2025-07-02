// File: \src\components\charts\GenericLightweightChart.jsx

import { useEffect, useRef } from 'react';
import * as LightweightCharts from 'lightweight-charts';

export const GenericLightweightChart = ({ chartType, data, onHover, extraSeries = [] }) => {
    const chartContainerRef = useRef();
    const onHoverRef = useRef(onHover);
    onHoverRef.current = onHover;

    useEffect(() => {
        if (!data || data.length === 0 || !chartContainerRef.current) {
            const container = chartContainerRef.current;
            if (container) container.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400">No data available for chart.</div>`;
            return;
        }

        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: { background: { color: 'transparent' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            timeScale: { timeVisible: true, secondsVisible: false },
        });

        let mainSeries;

        switch (chartType) {
            case 'Area':
                mainSeries = chart.addAreaSeries({
                    lineColor: '#4ecdc4', topColor: 'rgba(78, 205, 196, 0.5)', bottomColor: 'rgba(78, 205, 196, 0)', lineWidth: 2,
                });
                break;
            case 'Candlestick':
                mainSeries = chart.addCandlestickSeries({
                    upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
                    borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
                });
                break;
            default:
                console.error("Invalid chart type specified");
                return;
        }

        mainSeries.setData(data);

        // Process any extra series like price lines or markers
        extraSeries.forEach(seriesInfo => {
            if (seriesInfo.type === 'PriceLine') {
                // THE FIX: Convert string 'lineStyleName' to the correct enum value
                const lineStyle = LightweightCharts.LineStyle[seriesInfo.options.lineStyleName] || LightweightCharts.LineStyle.Solid;
                mainSeries.createPriceLine({
                    ...seriesInfo.options,
                    lineStyle: lineStyle,
                });
            }
            if (seriesInfo.type === 'Markers') {
                mainSeries.setMarkers(seriesInfo.data);
            }
        });
        
        if (onHoverRef.current) {
            chart.subscribeCrosshairMove(param => {
                if (param.time) {
                    const dataPoint = param.seriesData.get(mainSeries);
                    onHoverRef.current(dataPoint?.originalData?.signalId || null);
                } else {
                    onHoverRef.current(null);
                }
            });
            const container = chartContainerRef.current;
            container.addEventListener('mouseleave', () => onHoverRef.current(null));
        }

        chart.timeScale().fitContent();

        const handleResize = () => { if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth }); };
        window.addEventListener('resize', handleResize);

        return () => { window.removeEventListener('resize', handleResize); chart.remove(); };

    }, [chartType, data, extraSeries]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
};