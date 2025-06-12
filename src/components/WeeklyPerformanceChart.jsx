// File: src/components/WeeklyPerformanceChart.jsx

import { useMemo, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../App';

export const WeeklyPerformanceChart = ({ weeklyStats }) => {
    const { theme } = useContext(ThemeContext);

    const data = useMemo(() => {
        if (!weeklyStats) return { labels: [], datasets: [] };

        const labels = weeklyStats.map(w => w.week);
        return {
            labels,
            datasets: [
                {
                    label: 'Wins',
                    data: weeklyStats.map(w => w.wins),
                    backgroundColor: 'rgba(38, 166, 154, 0.6)',
                    borderColor: 'rgba(38, 166, 154, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Losses',
                    data: weeklyStats.map(w => w.losses),
                    backgroundColor: 'rgba(239, 83, 80, 0.6)',
                    borderColor: 'rgba(239, 83, 80, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [weeklyStats]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: theme === 'light' ? '#333' : '#D1D4DC',
                    boxWidth: 12,
                    font: { size: 12 },
                },
            },
            title: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: { color: theme === 'light' ? '#666' : '#999' },
                grid: { color: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { color: theme === 'light' ? '#666' : '#999' },
                grid: { color: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' },
            },
        },
    }), [theme]);

    return (
        // --- THIS IS THE FIX ---
        // Changed the background color and text color to match the other widgets.
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4">Weekly Performance</h3>
            <div className="relative flex-grow">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};