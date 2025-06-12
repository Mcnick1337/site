// File: src/utils/calculateStats.js (Updated with advanced metrics)

/**
 * This is the main calculation engine for the dashboard.
 * It contains all the logic for deriving statistics from the raw signal data.
 */

export function calculateAllStats(signals) {
    if (!signals || signals.length === 0) return {};

    let wins = 0, losses = 0, grossProfit = 0, grossLoss = 0, totalRR = 0, rrCount = 0;
    let equity = 10000, peakEquity = 10000, maxDrawdown = 0;
    const sortedSignals = [...signals].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const initialTimestamp = sortedSignals[0]?.timestamp ? new Date(sortedSignals[0].timestamp).getTime() : Date.now();
    const equityCurveData = [{ x: initialTimestamp, y: equity, signalId: null }];
    const returns = [];

    let currentWinStreak = 0, maxWinStreak = 0, currentLossStreak = 0, maxLossStreak = 0;

    sortedSignals.forEach(signal => {
        const status = signal.performance?.status?.toLowerCase();
        
        if (status === 'win' || status === 'loss') {
            if (status === 'win') {
                wins++;
                currentWinStreak++;
                currentLossStreak = 0;
                maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
            } else {
                losses++;
                currentLossStreak++;
                currentWinStreak = 0;
                maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
            }

            const entry = parseFloat(signal["Entry Price"]);
            const sl = parseFloat(signal["Stop Loss"]);
            const tp1 = parseFloat(signal["Take Profit Targets"]?.[0]);

            if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp1) && Math.abs(entry - sl) > 0) {
                const rr = Math.abs(tp1 - entry) / Math.abs(entry - sl);
                totalRR += rr;
                rrCount++;
                // Using a simple 100-unit risk per trade for calculations
                const profitOrLoss = status === 'win' ? (100 * rr) : -100;
                if (status === 'win') {
                    grossProfit += profitOrLoss;
                    returns.push(rr);
                } else {
                    grossLoss += profitOrLoss;
                    returns.push(-1);
                }
                equity += profitOrLoss;
            }

            peakEquity = Math.max(peakEquity, equity);
            maxDrawdown = Math.max(maxDrawdown, (peakEquity - equity) / peakEquity);
            
            if (signal.timestamp) {
                equityCurveData.push({ x: new Date(signal.timestamp).getTime(), y: equity, signalId: signal.timestamp });
            }
        }
    });
    
    const tradableSignals = wins + losses;
    
    // --- Standard Deviation and Sharpe Ratio ---
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 0 ? Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length) : 0;
    const sharpeRatio = stdDev !== 0 ? avgReturn / stdDev : 0;
    
    // --- ADDED: Sortino Ratio Calculation ---
    const negativeReturns = returns.filter(r => r < 0);
    // Downside deviation uses the total number of returns in the denominator, a common convention.
    const downsideDeviation = negativeReturns.length > 0 ? Math.sqrt(negativeReturns.map(x => Math.pow(x - 0, 2)).reduce((a, b) => a + b, 0) / returns.length) : 0;
    const sortinoRatio = downsideDeviation !== 0 ? avgReturn / downsideDeviation : 0;

    // --- ADDED: Average Win / Loss Calculation ---
    const avgWin = wins > 0 ? grossProfit / wins : 0;
    const avgLoss = losses > 0 ? grossLoss / losses : 0; // This will be a negative number

    return {
        winRate: tradableSignals > 0 ? (wins / tradableSignals) * 100 : 0,
        tradableSignals, wins, losses, maxWinStreak, maxLossStreak,
        profitFactor: grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : Infinity,
        avgRR: rrCount > 0 ? totalRR / rrCount : 0,
        sharpeRatio,
        maxDrawdown: maxDrawdown * 100, // Keep as percentage
        equityCurveData,
        // ADDED: New advanced stats
        sortinoRatio,
        avgWin,
        avgLoss,
    };
}

// --- The rest of the file (calculateSymbolWinRates, etc.) remains unchanged. ---

export function calculateSymbolWinRates(signals) {
    if (!signals) return [];
    const symbolStats = {};

    signals.forEach(s => {
        if (s.symbol && s.performance?.status) {
            const status = s.performance.status.toLowerCase();
            if (status === 'win' || status === 'loss') {
                if (!symbolStats[s.symbol]) {
                    symbolStats[s.symbol] = { wins: 0, losses: 0, grossProfit: 0, grossLoss: 0 };
                }
                if (status === 'win') symbolStats[s.symbol].wins++;
                else symbolStats[s.symbol].losses++;

                const entry = parseFloat(s["Entry Price"]);
                const sl = parseFloat(s["Stop Loss"]);
                const tp1 = parseFloat(s["Take Profit Targets"]?.[0]);
                if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp1) && Math.abs(entry - sl) > 0) {
                    const rr = Math.abs(tp1 - entry) / Math.abs(entry - sl);
                    const profitOrLoss = status === 'win' ? (100 * rr) : -100;
                    if (status === 'win') symbolStats[s.symbol].grossProfit += profitOrLoss;
                    else symbolStats[s.symbol].grossLoss += profitOrLoss;
                }
            }
        }
    });

    return Object.entries(symbolStats).map(([symbol, { wins, losses, grossProfit, grossLoss }]) => {
        const total = wins + losses;
        return {
            symbol, winRate: total > 0 ? (wins / total * 100) : 0,
            wins, losses, total, profitFactor: grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : Infinity,
        };
    }).sort((a, b) => b.total - a.total);
}

export function calculateTimeBasedStats(signals) {
    if (!signals) return { dayStats: {}, hourStats: {} };

    const dayStats = Array.from({ length: 7 }, () => ({ w: 0, l: 0 }));
    const hourStats = Array.from({ length: 24 }, () => ({ w: 0, l: 0 }));

    signals.forEach(s => {
        if (s.performance?.status && s.timestamp) {
            const status = s.performance.status.toLowerCase();
            if (status === 'win' || status === 'loss') {
                const date = new Date(s.timestamp);
                if (!isNaN(date.getTime())) {
                    const day = date.getDay();
                    const hour = date.getHours();
                    if (status === 'win') {
                        dayStats[day].w++;
                        hourStats[hour].w++;
                    } else {
                        dayStats[day].l++;
                        hourStats[hour].l++;
                    }
                }
            }
        }
    });
    return { dayStats, hourStats };
}

export function calculateCompoundingEquityCurve(signals, initialCapital, riskPercent) {
    if (!signals || signals.length === 0) return [];
    let capital = initialCapital;
    const sortedSignals = [...signals].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const initialTimestamp = sortedSignals[0]?.timestamp ? new Date(sortedSignals[0].timestamp).getTime() : Date.now();
    const equityCurve = [{ x: initialTimestamp, y: capital }];

    sortedSignals.forEach(signal => {
        if (signal.performance?.status && signal.timestamp) {
            const status = signal.performance.status.toLowerCase();
            if (status === 'win' || status === 'loss') {
                const entry = parseFloat(signal["Entry Price"]);
                const sl = parseFloat(signal["Stop Loss"]);
                const tp1 = parseFloat(signal["Take Profit Targets"]?.[0]);

                if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp1) && Math.abs(entry - sl) > 0) {
                    const riskAmount = capital * (riskPercent / 100);
                    const rr = Math.abs(tp1 - entry) / Math.abs(entry - sl);
                    const profitOrLoss = status === 'win' ? riskAmount * rr : -riskAmount;
                    capital += profitOrLoss;
                    equityCurve.push({ x: new Date(signal.timestamp).getTime(), y: capital });
                }
            }
        }
    });
    return equityCurve;
}

export function calculateCorrelation(signalsA, signalsB) {
    const getReturns = (signals) => new Map(signals.filter(s => s.performance?.status && s.timestamp).map(s => {
        const rr = Math.abs(parseFloat(s["Take Profit Targets"]?.[0]) - parseFloat(s["Entry Price"])) / Math.abs(parseFloat(s["Entry Price"]) - parseFloat(s["Stop Loss"]));
        return [s.timestamp, s.performance?.status?.toUpperCase() === 'WIN' ? (rr || 1) : -1];
    }));

    const returnsA = getReturns(signalsA);
    const returnsB = getReturns(signalsB);

    const allTimestamps = new Set([...returnsA.keys(), ...returnsB.keys()]);
    let x = [];
    let y = [];
    allTimestamps.forEach(ts => {
        x.push(returnsA.get(ts) || 0);
        y.push(returnsB.get(ts) || 0);
    });

    let n = x.length;
    if (n === 0) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (denominator === 0) return 0;
    return numerator / denominator;
}

export function calculateWeeklyStats(signals) {
    if (!signals || signals.length === 0) return [];

    const weeklyData = new Map();

    signals.forEach(s => {
        if (s.performance?.status && s.timestamp) {
            const status = s.performance.status.toLowerCase();
            if (status === 'win' || status === 'loss') {
                const date = new Date(s.timestamp);
                if (isNaN(date.getTime())) return;

                const dayOfWeek = date.getDay();
                const startOfWeek = new Date(date.setDate(date.getDate() - dayOfWeek));
                startOfWeek.setHours(0, 0, 0, 0);
                const weekKey = startOfWeek.toISOString().split('T')[0];

                if (!weeklyData.has(weekKey)) {
                    weeklyData.set(weekKey, { wins: 0, losses: 0 });
                }

                const week = weeklyData.get(weekKey);
                if (status === 'win') {
                    week.wins++;
                } else {
                    week.losses++;
                }
            }
        }
    });

    return Array.from(weeklyData.entries())
        .map(([week, data]) => ({ week, ...data }))
        .sort((a, b) => new Date(a.week) - new Date(b.week))
        .slice(-10);
}