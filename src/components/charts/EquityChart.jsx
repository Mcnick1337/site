import { Line } from 'react-chartjs-2';
// No 'chart.js' imports are needed here anymore

export const EquityChart = ({ equityCurveData, onSignalHover, timeUnit = 'hour' }) => {
    // ... the rest of the file is unchanged
    if (!equityCurveData || equityCurveData.length === 0) {
        return <div className="text-center text-gray-400">Not enough data for equity curve.</div>;
    }

    const data = {
        datasets: [{
            label: 'Equity', data: equityCurveData, borderColor: '#4ecdc4',
            backgroundColor: context => {
                if (!context.chart.ctx) return 'rgba(78, 205, 196, 0)';
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, 'rgba(78, 205, 196, 0.5)');
                gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
                return gradient;
            },
            fill: true, pointRadius: 0, tension: 0.1,
        }],
    };

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
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        onHover: (event, chartElement) => {
            if (onSignalHover && chartElement.length > 0) {
                const index = chartElement[0].index;
                onSignalHover(equityCurveData[index]?.signalId);
            } else if (onSignalHover) {
                onSignalHover(null);
            }
        },
    };

    return <div style={{ height: '300px' }}><Line options={options} data={data} /></div>;
};