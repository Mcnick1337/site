// File: src/utils/processSignals.js

// --- UPDATED: The function now accepts the full stats object ---
export function processSignals(signals, filters, sort, stats = {}) {
    if (!signals) return [];

    let signalsToProcess = [...signals].filter(s => s.Signal && s.Signal.toLowerCase() !== 'hold');

    // Standard Filtering Logic
    if (filters.symbol) signalsToProcess = signalsToProcess.filter(s => s.symbol?.toLowerCase().includes(filters.symbol.toLowerCase()));
    if (filters.signalType) signalsToProcess = signalsToProcess.filter(s => s.Signal?.toLowerCase() === filters.signalType.toLowerCase());
    if (filters.status) signalsToProcess = signalsToProcess.filter(s => s.performance?.status?.toLowerCase() === filters.status.toLowerCase());
    if (filters.minConfidence) signalsToProcess = signalsToProcess.filter(s => s.Confidence >= parseFloat(filters.minConfidence));
    if (filters.previousSignalStatus) {
        signalsToProcess = signalsToProcess.filter(s => s.previousStatus?.toLowerCase() === filters.previousSignalStatus.toLowerCase());
    }
    if (filters.reasoningSearch) {
        const searchTerms = filters.reasoningSearch.toLowerCase().split(' ').filter(term => term);
        if (searchTerms.length > 0) {
            signalsToProcess = signalsToProcess.filter(s => {
                const reasoning = s.Reasoning?.toLowerCase();
                if (!reasoning) return false;
                return searchTerms.every(term => reasoning.includes(term));
            });
        }
    }

    // Sorting Logic
    signalsToProcess.sort((a, b) => {
        switch (sort.by) {
            // --- ADDED: The new sorting case for the Confluence Score ---
            case 'topSignals': {
                const getScore = (signal) => {
                    if (!signal) return 0;
                    
                    // 1. Signal's own confidence (weight: 50%)
                    const confidenceScore = (signal.Confidence || 0) * 0.5;

                    // 2. Model's win rate on this specific symbol (weight: 30%)
                    const symbolWinRateData = stats.symbolWinRates?.find(rate => rate.symbol === signal.symbol);
                    const symbolWinRateScore = (symbolWinRateData?.winRate || 50) * 0.3; // Default to 50 if no data

                    // 3. Model's overall win rate (weight: 20%)
                    const overallWinRateScore = (stats.overallStats?.winRate || 50) * 0.2; // Default to 50

                    return confidenceScore + symbolWinRateScore + overallWinRateScore;
                };

                return getScore(b) - getScore(a);
            }
            case 'confidence':
                return (b.Confidence || 0) - (a.Confidence || 0);
            case 'symbol':
                return (a.symbol || '').localeCompare(b.symbol || '');
            case 'timestamp':
            default:
                return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        }
    });

    return signalsToProcess;
}