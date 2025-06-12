// File: src/components/simulation/BacktestEngine.jsx

import { useState } from 'react';
import { runBacktest } from '../../utils/calculateStats';
import { EquityChart } from '../charts/EquityChart';
import { StatsGrid } from '../StatsGrid';

export const BacktestEngine = ({ signals }) => {
    const [strategy, setStrategy] = useState({
        takeProfitRR: 2.0,
        timeExitHours: 48,
    });
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRunBacktest = async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const backtestResults = await runBacktest({ signals, strategy });
            
            // --- ADDED: Specific check for zero tradable signals ---
            if (backtestResults && backtestResults.tradableSignals === 0) {
                setError("Backtest completed but found 0 valid trades. This may indicate an issue with fetching historical price data. Please ensure your backend proxy supports the 'endTime' parameter.");
            } else {
                setResults(backtestResults);
            }

        } catch (err) {
            console.error("Backtest failed:", err);
            setError("The backtest could not be completed. Please check the console for details.");
        }
        setIsLoading(false);
    };

    const sharedInputStyles = `
      w-full bg-transparent text-white rounded-md border-0 py-1.5 px-3 
      ring-1 ring-inset ring-white/20 
      focus:ring-2 focus:ring-inset focus:ring-cyan-500
    `;

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Interactive Strategy Backtester</h3>
            <p className="text-gray-400 text-sm mb-6">
                Test how this model would have performed with your own custom exit rules. This is a simplified backtest and does not account for fees or slippage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
                <div>
                    <label htmlFor="tp-rr" className="block text-sm font-medium text-gray-400 mb-1">Take Profit (R:R)</label>
                    <input type="number" id="tp-rr" value={strategy.takeProfitRR} onChange={(e) => setStrategy(s => ({ ...s, takeProfitRR: Number(e.target.value) }))} className={sharedInputStyles} min="0.1" step="0.1" />
                </div>
                <div>
                    <label htmlFor="time-exit" className="block text-sm font-medium text-gray-400 mb-1">Max Hold Time (Hours)</label>
                    <input type="number" id="time-exit" value={strategy.timeExitHours} onChange={(e) => setStrategy(s => ({ ...s, timeExitHours: Number(e.target.value) }))} className={sharedInputStyles} min="1" step="1" />
                </div>
                <button onClick={handleRunBacktest} disabled={isLoading || signals.length === 0} className="bg-cyan-600 text-white font-semibold rounded-lg px-4 py-2 h-10 transition-colors hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isLoading ? 'Running Simulation...' : 'Run Backtest'}
                </button>
            </div>

            {isLoading && (
                <div className="text-center p-8 animate-pulse">Calculating results... This may take a moment.</div>
            )}
            
            {error && (
                <div className="text-center p-8 text-red-400">{error}</div>
            )}

            {results && (
                <div className="mt-8">
                    <h4 className="text-xl font-bold mb-4">Backtest Results</h4>
                    <StatsGrid stats={results} />
                    <div className="h-[350px] mt-6">
                        <EquityChart equityCurveData={results.equityCurveData} timeUnit="day" />
                    </div>
                </div>
            )}
        </div>
    );
};