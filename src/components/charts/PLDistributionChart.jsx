// File: src/components/charts/PLDistributionChart.jsx

import React, { useMemo, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../App';

export const PLDistributionChart = ({ returns }) => {
    const { theme } = useContext(ThemeContext);

    const chartData = useMemo(() => {
        if (!returns || returns.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Define the bins for the histogram (e.g., -1R, 0-1R, 1-2R, etc.)
        const bins = [-Infinity, -0.99, 0, 1, 2, 3, Infinity];
        const labels = ['<-1R', '-1R', '0-1R', '1-2R', '2-3R', '>3R'];
        const data = Array(bins.length - 1).fill(0);

        returns.forEach(r => {
            for (let i = 0; i < bins.length - 1; i++) {
                if (r >= bins[i] && r < bins[i+1]) {
                    data[i]++;
                    break;
                }
            }
        });

        const backgroundColors = data.map((_, index) => {
            const binLabel = labels[index];
            return binLabel.includes('-') ? 'rgba(242, 54, 69, 0.6)' : 'rgba(8, 153, 129, 0.6)';
        });

        return {
            labels,
            datasets: [{
                label: 'Number of Trades',
                data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c.replace('0.6', '1')),
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 0.9,
            }],
        };
    }, [returns]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                callbacks: {
                    title: (context) => `P/L Range: ${context[0].label}`,
                    label: (context) => `Trades: ${context.raw}`,
                },
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Profit/Loss in R-Multiple', color: theme === 'light' ? '#666' : '#999' },
                ticks: { color: theme === 'light' ? '#666' : '#999' },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: '# of Trades', color: theme === 'light' ? '#666' : '#999' },
                ticks: { color: theme === 'light' ? '#666' : '#999', stepSize: 1 },
                grid: { color: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
            },
        },
    }), [theme]);

    if (!returns || returns.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No trade data available.</div>;
    }

    return <Bar data={chartData} options={options} />;
};