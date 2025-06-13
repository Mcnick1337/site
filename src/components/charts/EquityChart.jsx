// File: src/components/charts/EquityChart.jsx

import { Line } from 'react-chartjs-2';

// --- UPDATED: Component now accepts trendlineData ---
export const EquityChart = ({ equityCurveData, trendlineData, onSignalHover, timeUnit = 'hour' }) => {
    if (!equityCurveData || equityCurveData.length === 0) {
        return <div className="text-center text-gray-400">Not enough data for equity curve.</div>;
    }

    const datasets = [{
        label: 'Equity',
        data: equityCurveData,
        borderColor: '#4ecdc4',
        backgroundColor: context => {
            if (!context.chart.ctx) return 'rgba(78, 205, 196, 0)';
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
            gradient.addColorStop(0, 'rgba(78, 205, 196, 0.5)');
            gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
            return gradient;
        },
        fill: true,
        pointRadius: 0,
        tension: 0.1,
    }];

    // --- ADDED: Conditionally add the trendline dataset if it exists ---
    if (trendlineData && trendlineData.length > 0) {
        datasets.push({
            label: 'Trendline',
            data: trendlineData,
            borderColor: 'rgba(255, 255, 255, 0.4)', // Faint white/gray color
            borderWidth: 2,
            borderDash: [6, 6], // Dashed line style
            fill: false,
            pointRadius: 0,
            tension: 0, // A trendline should be perfectly straight
        });
    }

    const data = { datasets };

    const options = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: { unit: timeUnit },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#a0a0a0' },
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#a0a0a0', callback: (value) => `$${value.toLocaleString()}` },
            },
        },
        plugins: { 
            legend: { display: false }, 
            tooltip: { 
                mode: 'index', 
                intersect: false,
                // --- UPDATED: Filter out the trendline from the tooltip ---
                filter: (tooltipItem) => tooltipItem.dataset.label !== 'Trendline',
            } 
        },
        onHover: (event, chartElement) => {
            if (onSignalHover && chartElement.length > 0) {
                const item = chartElement[0];
                // --- UPDATED: Ensure hover only works on the main equity curve ---
                if (item.datasetIndex === 0) {
                    onSignalHover(equityCurveData[item.index]?.signalId);
                }
            } else if (onSignalHover) {
                onSignalHover(null);
            }
        },
    };
    
    return (
        <div className="relative h-full w-full">
            <Line options={options} data={data} />
        </div>
    );
};