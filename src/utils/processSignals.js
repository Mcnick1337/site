// File: src/utils/processSignals.js

export function processSignals(signals, filters, sort) {
    if (!signals) return []; // Add a guard clause for safety

    let signalsToProcess = [...signals].filter(s => s.Signal && s.Signal.toLowerCase() !== 'hold');

    // Filtering logic
    if (filters.symbol) signalsToProcess = signalsToProcess.filter(s => s.symbol?.toLowerCase().includes(filters.symbol.toLowerCase()));
    if (filters.signalType) signalsToProcess = signalsToProcess.filter(s => s.Signal?.toLowerCase() === filters.signalType.toLowerCase());
    
    // --- THIS IS THE FIX ---
    // Use optional chaining `?.` to prevent a crash if `performance` is missing.
    if (filters.status) signalsToProcess = signalsToProcess.filter(s => s.performance?.status?.toLowerCase() === filters.status.toLowerCase());
    
    if (filters.minConfidence) signalsToProcess = signalsToProcess.filter(s => s.Confidence >= parseFloat(filters.minConfidence));

    // Sorting logic
    signalsToProcess.sort((a, b) => {
        switch (sort.by) {
            case 'confidence':
                return (b.Confidence || 0) - (a.Confidence || 0);
            case 'symbol':
                return (a.symbol || '').localeCompare(b.symbol || '');
            case 'timestamp':
            default:
                // FIX: Also make sure timestamps are valid before comparing
                return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        }
    });

    return signalsToProcess;
}