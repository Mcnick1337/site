import { useState } from 'react';
import { calculateAllStats } from '../../utils/calculateStats';

const daysOfWeek = [
    { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' }, { id: 0, label: 'Sun' }
];

export const BacktestEngine = ({ allSignals }) => {
    const [config, setConfig] = useState({
        minConfidence: 80,
        selectedDays: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }
    });
    const [results, setResults] = useState(null);
    const [hasRun, setHasRun] = useState(false);

    const handleDayToggle = (dayId) => {
        setConfig(prev => ({
            ...prev,
            selectedDays: { ...prev.selectedDays, [dayId]: !prev.selectedDays[dayId] }
        }));
    };

    const handleRunBacktest = () => {
        setHasRun(true);
        if (allSignals.length === 0) {
            setResults(null);
            return;
        }

        const selectedDayIds = Object.keys(config.selectedDays).filter(day => config.selectedDays[day]).map(Number);

        const filteredSignals = allSignals.filter(s => {
            const confidenceMatch = (s.Confidence || 0) >= config.minConfidence;
            const dayMatch = selectedDayIds.includes(new Date(s.timestamp).getDay());
            return confidenceMatch && dayMatch;
        });
        
        if(filteredSignals.length > 0) {
            const stats = calculateAllStats(filteredSignals);
            setResults(stats);
        } else {
            setResults(null);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Custom Strategy Backtest</h3>
            <p className="text-sm text-gray-400 mb-4">
                Create a custom strategy by filtering signals to see the performance results.
            </p>
            <div className="flex flex-wrap items-end gap-6 mb-4">
                <div>
                    <label htmlFor="customConfidence" className="block text-xs font-medium text-gray-400 mb-1">Min. Confidence</label>
                    <input
                        type="number"
                        id="customConfidence"
                        value={config.minConfidence}
                        onChange={e => setConfig({ ...config, minConfidence: Number(e.target.value) })}
                        className="w-full bg-white/10 rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    />
                </div>
                <div className="flex-grow">
                    <label className="block text-xs font-medium text-gray-400 mb-2">Days to Trade</label>
                    <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                            <button
                                key={day.id}
                                onClick={() => handleDayToggle(day.id)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${config.selectedDays[day.id] ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={handleRunBacktest} className="bg-purple-600 hover:bg-purple-500 rounded-md py-2 px-4 font-semibold transition w-full sm:w-auto">
                Run Backtest
            </button>

            {hasRun && (
                 <div className="mt-6 border-t border-white/10 pt-4">
                    <h4 className="font-semibold mb-2">Backtest Results:</h4>
                    {results ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div><div className="text-2xl font-bold text-cyan-400">{results.winRate.toFixed(2)}%</div><div className="text-xs text-gray-400">Win Rate</div></div>
                            <div><div className="text-2xl font-bold">{results.tradableSignals}</div><div className="text-xs text-gray-400">Signals</div></div>
                            <div><div className="text-2xl font-bold text-green-400">{isFinite(results.profitFactor) ? results.profitFactor.toFixed(2) : 'N/A'}</div><div className="text-xs text-gray-400">Profit Factor</div></div>
                            <div><div className="text-2xl font-bold text-amber-400">{results.sharpeRatio.toFixed(2)}</div><div className="text-xs text-gray-400">Sharpe Ratio</div></div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-4">No signals found for this backtest criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
};