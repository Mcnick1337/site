export function processSignals(signals, filters, sort) {
let signalsToProcess = [...signals].filter(s => s.Signal && s.Signal.toLowerCase() !== 'hold');
// Filtering logic
if (filters.symbol) signalsToProcess = signalsToProcess.filter(s => s.symbol?.toLowerCase().includes(filters.symbol.toLowerCase()));
if (filters.signalType) signalsToProcess = signalsToProcess.filter(s => s.Signal?.toLowerCase() === filters.signalType.toLowerCase());
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
            return new Date(b.timestamp) - new Date(a.timestamp);
    }
});

return signalsToProcess;
}