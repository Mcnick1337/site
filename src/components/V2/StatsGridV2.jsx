// File: src/components/v2/StatsGridV2.jsx

import React, { useMemo } from 'react';

const StatCardV2 = ({ label, value, colorClass = 'text-white' }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20">
        <div className={`text-4xl font-bold mb-2 ${colorClass}`}>{value}</div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
);

export const StatsGridV2 = ({ metrics }) => {
    const overallStats = useMemo(() => {
        let totalWins = 0;
        let totalLosses = 0;

        for (const symbol in metrics) {
            if (metrics[symbol].LONG) {
                totalWins += metrics[symbol].LONG.wins;
                totalLosses += metrics[symbol].LONG.losses;
            }
            if (metrics[symbol].SHORT) {
                totalWins += metrics[symbol].SHORT.wins;
                totalLosses += metrics[symbol].SHORT.losses;
            }
        }

        const totalSignals = totalWins + totalLosses;
        const winRate = totalSignals > 0 ? (totalWins / totalSignals) * 100 : 0;

        return { totalWins, totalLosses, totalSignals, winRate };
    }, [metrics]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            <StatCardV2 label="Overall Win Rate" value={`${overallStats.winRate.toFixed(2)}%`} colorClass="text-cyan-400" />
            <StatCardV2 label="Total Signals" value={overallStats.totalSignals} />
            <StatCardV2 label="Total Wins" value={overallStats.totalWins} colorClass="text-green-400" />
            <StatCardV2 label="Total Losses" value={overallStats.totalLosses} colorClass="text-red-400" />
        </div>
    );
};