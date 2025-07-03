// File: src/utils/calculateStatsV2.js

/**
 * This is the main calculation engine for the new V2 Advanced dashboard.
 * It reads the pre-calculated `performance` object from each signal.
 */
export function calculateAllStatsV2_Advanced(signals) {
    if (!signals || signals.length === 0) return null;

    const completedTrades = signals.filter(s => s.performance && (s.performance.status === 'WIN' || s.performance.status === 'LOSS'));

    if (completedTrades.length === 0) return null;
    
    const sortedTrades = [...completedTrades].sort((a, b) => new Date(a.performance.exit_time) - new Date(b.performance.exit_time));

    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let equity = 10000;
    const equityCurveData = [{ x: new Date(sortedTrades[0].timestamp_utc).getTime(), y: equity }];
    const returns = [];
    
    // --- ADDED: Variables for new advanced stats ---
    let totalWinDuration = 0;
    let totalLossDuration = 0;
    let totalFavorableExcursion = 0;
    let totalAdverseExcursion = 0;

    for (const trade of sortedTrades) {
        const pnl = trade.performance.profit_and_loss_usd;
        const entry = trade.trade_parameters.entry_price;
        const risk = Math.abs(trade.trade_parameters.stop_loss - entry);
        const rMultiple = risk > 0 ? pnl / risk : 0;
        returns.push(rMultiple);

        if (trade.performance.status === 'WIN') {
            wins++;
            grossProfit += pnl;
            totalWinDuration += trade.performance.duration_hours;
        } else {
            losses++;
            grossLoss += pnl;
            totalLossDuration += trade.performance.duration_hours;
        }
        
        totalFavorableExcursion += trade.performance.max_favorable_excursion_usd;
        totalAdverseExcursion += trade.performance.max_adverse_excursion_usd;

        equity += (rMultiple * 100);
        equityCurveData.push({ x: new Date(trade.performance.exit_time).getTime(), y: equity });
    }

    const tradableSignals = completedTrades.length;
    const winRate = (wins / tradableSignals) * 100;
    const profitFactor = grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : Infinity;

    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 0 ? Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length) : 0;
    const sharpeRatio = stdDev !== 0 ? (avgReturn / stdDev) * Math.sqrt(365) : 0;

    return {
        winRate,
        tradableSignals,
        profitFactor,
        sharpeRatio,
        equityCurveData,
        plDistribution: returns,
        // --- ADDED: The new aggregated stats ---
        tradeCharacter: {
            avgWin: wins > 0 ? grossProfit / wins : 0,
            avgLoss: losses > 0 ? grossLoss / losses : 0,
            avgWinDuration: wins > 0 ? totalWinDuration / wins : 0,
            avgLossDuration: losses > 0 ? totalLossDuration / losses : 0,
        },
        tradeExcursion: {
            avgFavorable: tradableSignals > 0 ? totalFavorableExcursion / tradableSignals : 0,
            avgAdverse: tradableSignals > 0 ? totalAdverseExcursion / tradableSignals : 0,
        }
    };
}