// File: src/components/V2/DetailsSectionV2_Advanced.jsx

import React from 'react';
import { EquityChart } from '../charts/EquityChart';
import { PLDistributionChart } from '../charts/PLDistributionChart';

// --- ADDED: New dedicated components for the advanced widgets ---
const TradeCharacterWidget = ({ data }) => {
    if (!data) return null;
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
            <h3 className="text-xl font-bold mb-4">Trade Character</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-400">Avg. Win</p>
                    <p className="text-2xl font-bold text-green-400">${data.avgWin.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Avg. Loss</p>
                    <p className="text-2xl font-bold text-red-400">${Math.abs(data.avgLoss).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Avg. Win Duration</p>
                    <p className="text-lg font-semibold">{data.avgWinDuration.toFixed(1)}h</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Avg. Loss Duration</p>
                    <p className="text-lg font-semibold">{data.avgLossDuration.toFixed(1)}h</p>
                </div>
            </div>
        </div>
    );
};

const TradeExcursionWidget = ({ data }) => {
    if (!data) return null;
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
            <h3 className="text-xl font-bold mb-4">Trade Excursion</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-400">Avg. Favorable (MFE)</p>
                    <p className="text-2xl font-bold text-green-400">${data.avgFavorable.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Avg. Adverse (MAE)</p>
                    <p className="text-2xl font-bold text-red-400">${data.avgAdverse.toFixed(2)}</p>
                </div>
                <p className="col-span-2 text-xs text-gray-500 mt-2">
                    MFE shows potential profit left on the table. MAE shows the average drawdown per trade.
                </p>
            </div>
        </div>
    );
};


export const DetailsSectionV2_Advanced = ({ stats }) => {
    if (!stats || Object.keys(stats).length === 0) {
        return null;
    }

    return (
        <div className="my-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Hypothetical Equity Curve</h3>
                <EquityChart 
                    equityCurveData={stats.equityCurveData} 
                    timeUnit="day"
                />
            </div>

            {/* --- UPDATED: Grid now includes the new advanced widgets --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TradeCharacterWidget data={stats.tradeCharacter} />
                <TradeExcursionWidget data={stats.tradeExcursion} />
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col lg:col-span-2">
                    <h3 className="text-xl font-bold mb-4">Trade P/L Distribution (R-Multiple)</h3>
                    <div className="flex-grow min-h-[250px]">
                        <PLDistributionChart returns={stats.plDistribution} />
                    </div>
                </div>
            </div>
        </div>
    );
};