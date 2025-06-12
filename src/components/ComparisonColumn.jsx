// File: src/components/ComparisonColumn.jsx

import React from 'react';
import { EquityChart } from './charts/EquityChart';

const MiniStatCard = ({ label, value, colorClass = 'text-white' }) => (
    <div className="bg-white/5 p-4 rounded-lg text-center">
        <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
);

export const ComparisonColumn = ({ modelData }) => {
    const { overallStats, equityCurveData } = modelData;

    // Helper to safely format numbers
    const formatStat = (val, decimals = 2) => {
        if (typeof val !== 'number' || !isFinite(val)) return 'N/A';
        return val.toFixed(decimals);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Section with advanced metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MiniStatCard 
                    label="Win Rate" 
                    value={`${formatStat(overallStats.winRate)}%`}
                    colorClass="text-cyan-400" 
                />
                <MiniStatCard 
                    label="Profit Factor" 
                    value={formatStat(overallStats.profitFactor)}
                    colorClass="text-green-400"
                />
                <MiniStatCard 
                    label="Sortino Ratio" 
                    value={formatStat(overallStats.sortinoRatio)}
                    colorClass="text-amber-400"
                />
                <MiniStatCard 
                    label="Avg Win / Loss"
                    value={`${formatStat(overallStats.avgWin / Math.abs(overallStats.avgLoss))}:1`}
                    colorClass="text-purple-400"
                />
                <MiniStatCard 
                    label="Max Drawdown" 
                    value={`${formatStat(overallStats.maxDrawdown)}%`}
                    colorClass="text-red-400"
                />
                <MiniStatCard 
                    label="Signals" 
                    value={overallStats.tradableSignals ?? 0} 
                />
            </div>

            {/* Chart Section with corrected flexbox layout */}
            <div className="bg-white/5 rounded-2xl p-6 h-[300px] overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold mb-4 flex-shrink-0">Hypothetical Equity Curve</h3>
                <div className="flex-grow relative">
                    {equityCurveData && equityCurveData.length > 0 ? (
                        <EquityChart 
                            equityCurveData={equityCurveData} 
                            timeUnit="day"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No data available to display chart.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};