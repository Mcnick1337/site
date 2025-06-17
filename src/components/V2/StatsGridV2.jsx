// File: src/components/v2/StatsGridV2.jsx

import React, { useMemo } from 'react';

const StatCardV2 = ({ label, value, colorClass = 'text-white' }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 h-full flex flex-col justify-center">
        <div className={`text-4xl font-bold mb-2 ${colorClass}`}>{value}</div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
);

// --- ADDED: A more detailed card for complex stats ---
const DetailedStatCard = ({ title, mainValue, mainValueColor, subValue, subValueColor }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 h-full flex flex-col justify-center">
        <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">{title}</p>
        <p className={`text-4xl font-bold mb-1 ${mainValueColor}`}>{mainValue}</p>
        <p className={`text-sm font-semibold ${subValueColor}`}>{subValue}</p>
    </div>
);

export const StatsGridV2 = ({ metrics }) => {
    const advancedStats = useMemo(() => {
        let totalWins = 0, totalLosses = 0;
        let longWins = 0, longLosses = 0;
        let shortWins = 0, shortLosses = 0;
        const symbolPerformance = [];

        for (const symbol in metrics) {
            let symbolWins = 0, symbolLosses = 0;
            if (metrics[symbol].LONG) {
                longWins += metrics[symbol].LONG.wins;
                longLosses += metrics[symbol].LONG.losses;
                symbolWins += metrics[symbol].LONG.wins;
                symbolLosses += metrics[symbol].LONG.losses;
            }
            if (metrics[symbol].SHORT) {
                shortWins += metrics[symbol].SHORT.wins;
                shortLosses += metrics[symbol].SHORT.losses;
                symbolWins += metrics[symbol].SHORT.wins;
                symbolLosses += metrics[symbol].SHORT.losses;
            }
            const totalSymbolTrades = symbolWins + symbolLosses;
            if (totalSymbolTrades > 0) {
                symbolPerformance.push({
                    symbol,
                    winRate: (symbolWins / totalSymbolTrades) * 100,
                    trades: totalSymbolTrades,
                });
            }
        }
        
        totalWins = longWins + shortWins;
        totalLosses = longLosses + shortLosses;
        const totalSignals = totalWins + totalLosses;
        const overallWinRate = totalSignals > 0 ? (totalWins / totalSignals) * 100 : 0;
        const longWinRate = (longWins + longLosses) > 0 ? (longWins / (longWins + longLosses)) * 100 : 0;
        const shortWinRate = (shortWins + shortLosses) > 0 ? (shortWins / (shortWins + shortLosses)) * 100 : 0;

        // Sort symbols by win rate to find the best and worst
        symbolPerformance.sort((a, b) => b.winRate - a.winRate);
        const bestSymbol = symbolPerformance[0] || { symbol: 'N/A', winRate: 0 };
        const worstSymbol = symbolPerformance[symbolPerformance.length - 1] || { symbol: 'N/A', winRate: 0 };

        return { totalSignals, overallWinRate, longWinRate, shortWinRate, bestSymbol, worstSymbol };
    }, [metrics]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            <StatCardV2 
                label="Overall Win Rate" 
                value={`${advancedStats.overallWinRate.toFixed(1)}%`} 
                colorClass="text-cyan-400" 
            />
            <DetailedStatCard 
                title="Directional Win Rate"
                mainValue={`${advancedStats.longWinRate.toFixed(1)}%`}
                mainValueColor="text-green-400"
                subValue="LONGS"
            />
            <DetailedStatCard 
                title="Directional Win Rate"
                mainValue={`${advancedStats.shortWinRate.toFixed(1)}%`}
                mainValueColor="text-red-400"
                subValue="SHORTS"
            />
            <StatCardV2 
                label="Total Signals" 
                value={advancedStats.totalSignals} 
            />
            <DetailedStatCard
                title="Best Performing Symbol"
                mainValue={advancedStats.bestSymbol.symbol}
                mainValueColor="text-white"
                subValue={`${advancedStats.bestSymbol.winRate.toFixed(1)}% Win Rate`}
                subValueColor="text-green-400"
            />
            <DetailedStatCard
                title="Worst Performing Symbol"
                mainValue={advancedStats.worstSymbol.symbol}
                mainValueColor="text-white"
                subValue={`${advancedStats.worstSymbol.winRate.toFixed(1)}% Win Rate`}
                subValueColor="text-red-400"
            />
        </div>
    );
};