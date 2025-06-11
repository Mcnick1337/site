import { Bar } from 'react-chartjs-2';
// No 'chart.js' imports are needed here anymore

export const TimeChart = ({ chartData, labels }) => {
    // ... the rest of the file is unchanged
    if (!chartData || Object.keys(chartData).length === 0) {
        return <div className="text-center text-gray-400">Loading time data...</div>;
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Wins',
                data: labels.map((label, index) => chartData[index]?.w || 0),
                backgroundColor: 'rgba(78, 205, 196, 0.7)',
            },
            {
                label: 'Losses',
                data: labels.map((label, index) => chartData[index]?.l || 0),
                backgroundColor: 'rgba(255, 107, 107, 0.7)',
            },
        ],
    };

    const options = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            x: { stacked: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } },
            y: { stacked: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } },
        },
        plugins: {
            legend: { labels: { color: '#a0a0a0' } },
            tooltip: { mode: 'index', intersect: false },
        },
    };

    return <div style={{ height: '250px' }}><Bar options={options} data={data} /></div>;
};