// File: src/utils/calculateStats.js

/**
 * This is the main calculation engine for the dashboard.
 * It contains all the logic for deriving statistics from the raw signal data.
 */

async function fetchOHLCForBacktest(symbol, startTime, endTime) {
    const url = `/.netlify/functions/crypto-proxy?symbol=${symbol.toUpperCase()}&startTime=${startTime}&interval=1m&endTime=${endTime}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.map(d => ({ time: parseInt(d[0]) * 1000, high: parseFloat(d[3]), low: parseFloat(d[4]), close: parseFloat(d[2]) }));
    } catch (error) {
        console.error("Error fetching OHLC for backtest:", error);
        return [];
    }
}

export async function runBacktest({ signals, strategy }) {
    if (!signals || signals.length === 0) return null;

    let equity = 10000;
    let peakEquity = 10000;
    let maxDrawdown = 0;
    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    const returns = [];
    const equityCurveData = [{ x: new Date(signals[0]?.timestamp).getTime(), y: equity }];

    const sortedSignals = [...signals].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const signal of sortedSignals) {
        const entryPrice = parseFloat(signal["Entry Price"]);
        const stopLossPrice = parseFloat(signal["Stop Loss"]);
        const signalType = signal.Signal?.toLowerCase();

        if (isNaN(entryPrice) || isNaN(stopLossPrice) || !signalType || !signal.timestamp) continue;

        const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
        const takeProfitPrice = signalType === 'buy'
            ? entryPrice + (riskPerUnit * strategy.takeProfitRR)
            : entryPrice - (riskPerUnit * strategy.takeProfitRR);

        const signalTime = new Date(signal.timestamp).getTime();
        const exitTime = signalTime + (strategy.timeExitHours * 60 * 60 * 1000);

        const ohlcData = await fetchOHLCForBacktest(signal.symbol, signalTime, exitTime);
        if (ohlcData.length === 0) continue;

        let outcome = { status: 'timeout', exitPrice: ohlcData[ohlcData.length - 1].close, exitTime: exitTime };

        for (const candle of ohlcData) {
            const hitsSL = signalType === 'buy' ? candle.low <= stopLossPrice : candle.high >= stopLossPrice;
            const hitsTP = signalType === 'buy' ? candle.high >= takeProfitPrice : candle.low <= takeProfitPrice;

            if (hitsSL && hitsTP) {
                outcome = { status: 'loss', exitPrice: stopLossPrice, exitTime: candle.time };
                break;
            }
            if (hitsSL) {
                outcome = { status: 'loss', exitPrice: stopLossPrice, exitTime: candle.time };
                break;
            }
            if (hitsTP) {
                outcome = { status: 'win', exitPrice: takeProfitPrice, exitTime: candle.time };
                break;
            }
        }
        
        const pnl = signalType === 'buy' ? outcome.exitPrice - entryPrice : entryPrice - outcome.exitPrice;
        const pnlAsRiskUnit = pnl / riskPerUnit;
        returns.push(pnlAsRiskUnit);

        if (pnl > 0) {
            wins++;
            grossProfit += pnl;
        } else {
            losses++;
            grossLoss += pnl;
        }
        
        equity += (pnlAsRiskUnit * 100);
        peakEquity = Math.max(peakEquity, equity);
        maxDrawdown = Math.max(maxDrawdown, (peakEquity - equity) / peakEquity);
        equityCurveData.push({ x: outcome.exitTime, y: equity });
    }

    const tradableSignals = wins + losses;
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 0 ? Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length) : 0;
    
    return {
        winRate: tradableSignals > 0 ? (wins / tradableSignals) * 100 : 0,
        tradableSignals,
        wins,
        losses,
        profitFactor: grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : Infinity,
        sharpeRatio: stdDev !== 0 ? avgReturn / stdDev : 0,
        maxDrawdown: maxDrawdown * 100,
        equityCurveData,
    };
}

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
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 0 ? Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length) : 0;
    const sharpeRatio = stdDev !== 0 ? avgReturn / stdDev : 0;
    const negativeReturns = returns.filter(r => r < 0);
    const downsideDeviation = negativeReturns.length > 0 ? Math.sqrt(negativeReturns.map(x => Math.pow(x - 0, 2)).reduce((a, b) => a + b, 0) / returns.length) : 0;
    const sortinoRatio = downsideDeviation !== 0 ? avgReturn / downsideDeviation : 0;
    const avgWin = wins > 0 ? grossProfit / wins : 0;
    const avgLoss = losses > 0 ? grossLoss / losses : 0;

    return {
        winRate: tradableSignals > 0 ? (wins / tradableSignals) * 100 : 0,
        tradableSignals, wins, losses, maxWinStreak, maxLossStreak,
        profitFactor: grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : Infinity,
        avgRR: rrCount > 0 ? totalRR / rrCount : 0,
        sharpeRatio, maxDrawdown: maxDrawdown * 100, equityCurveData,
        sortinoRatio, avgWin, avgLoss, returns,
    };
}

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

export function calculateLearningStatus(signals) {
    if (!signals || signals.length < 20) {
        return { status: 'Learning', color: 'text-gray-400' };
    }

    const sortedSignals = [...signals]
        .filter(s => s.performance?.status)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (sortedSignals.length < 20) {
        return { status: 'Learning', color: 'text-gray-400' };
    }

    const midpoint = Math.floor(sortedSignals.length / 2);
    const firstHalf = sortedSignals.slice(0, midpoint);
    const secondHalf = sortedSignals.slice(midpoint);

    const getProfitFactor = (tradeSet) => {
        let grossProfit = 0;
        let grossLoss = 0;
        tradeSet.forEach(signal => {
            const entry = parseFloat(signal["Entry Price"]);
            const sl = parseFloat(signal["Stop Loss"]);
            const tp1 = parseFloat(signal["Take Profit Targets"]?.[0]);
            if (isNaN(entry) || isNaN(sl) || isNaN(tp1) || Math.abs(entry - sl) === 0) return;
            
            const rr = Math.abs(tp1 - entry) / Math.abs(entry - sl);
            const profitOrLoss = signal.performance.status.toLowerCase() === 'win' ? (100 * rr) : -100;
            
            if (profitOrLoss > 0) grossProfit += profitOrLoss;
            else grossLoss += profitOrLoss;
        });
        if (grossLoss === 0) return Infinity;
        return Math.abs(grossProfit / grossLoss);
    };

    const pfFirstHalf = getProfitFactor(firstHalf);
    const pfSecondHalf = getProfitFactor(secondHalf);

    if (pfSecondHalf > pfFirstHalf * 1.2) {
        return { status: 'Improving', color: 'text-green-400' };
    }
    if (pfFirstHalf > pfSecondHalf * 1.2) {
        return { status: 'Degrading', color: 'text-red-400' };
    }
    return { status: 'Stable', color: 'text-amber-400' };
}

export function calculateTrendlineStatus(equityCurveData) {
    if (!equityCurveData || equityCurveData.length < 10) {
        return {
            status: 'Learning',
            color: 'text-gray-400',
            slope: 0,
            trendlineData: [],
        };
    }

    const points = equityCurveData.map((d, i) => ({ x: i, y: d.y }));
    const n = points.length;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += points[i].x;
        sumY += points[i].y;
        sumXY += points[i].x * points[i].y;
        sumX2 += points[i].x * points[i].x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendlineData = equityCurveData.map((d, i) => ({
        x: d.x,
        y: slope * i + intercept,
    }));
    
    const normalizedSlope = slope / equityCurveData[0].y * 100; 

    let status, color;
    if (normalizedSlope > 0.05) {
        status = 'Improving';
        color = 'text-green-400';
    } else if (normalizedSlope < -0.05) {
        status = 'Degrading';
        color = 'text-red-400';
    } else {
        status = 'Stable';
        color = 'text-amber-400';
    }

    return { status, color, slope, trendlineData };
}