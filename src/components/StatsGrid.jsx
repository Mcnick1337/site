import React from 'react';

const StatCard = ({ label, value, colorClass, tooltip }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20">
        <div className={`text-4xl font-bold mb-2 ${colorClass}`}>{value}</div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
);

export const StatsGrid = ({ stats }) => {
    if (!stats || Object.keys(stats).length === 0) {
        return <div className="text-center p-8">Loading stats...</div>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            <StatCard label="Win Rate" value={`${stats.winRate?.toFixed(2) ?? 0}%`} colorClass="text-cyan-400" />
            <StatCard label="Tradable Signals" value={stats.tradableSignals ?? 0} colorClass="text-white" />
            <StatCard label="Profit Factor" value={isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : 'N/A'} colorClass="text-green-400" />
            <StatCard label="Sharpe Ratio" value={stats.sharpeRatio?.toFixed(2) ?? 0} colorClass="text-amber-400" />
        </div>
    );
};