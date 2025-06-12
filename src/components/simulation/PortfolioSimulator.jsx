// File: src/components/simulation/PortfolioSimulator.jsx

import { useState, useMemo, useContext } from 'react';
import { calculateCompoundingEquityCurve } from '../../utils/calculateStats';
import { EquityChart } from '../charts/EquityChart';
import { ThemeContext } from '../../App';

// A simple, reusable card for displaying the simulation results.
const ResultCard = ({ label, value, colorClass = 'text-white' }) => (
    <div className="text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

export const PortfolioSimulator = ({ signals }) => {
    const [initialCapital, setInitialCapital] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const { theme } = useContext(ThemeContext);

    const simulationResults = useMemo(() => {
        if (!signals || signals.length === 0) return null;
        return calculateCompoundingEquityCurve(signals, initialCapital, riskPercent);
    }, [signals, initialCapital, riskPercent]);

    const finalBalance = simulationResults ? simulationResults[simulationResults.length - 1].y : initialCapital;
    const totalReturn = ((finalBalance - initialCapital) / initialCapital) * 100;

    const sharedInputStyles = `
      w-full bg-transparent text-white rounded-md border-0 py-1.5 px-3 
      ring-1 ring-inset ring-white/20 
      focus:ring-2 focus:ring-inset focus:ring-cyan-500
    `;

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Compounding Portfolio Simulator</h3>
            
            {/* --- INPUT CONTROLS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label htmlFor="initial-capital" className="block text-sm font-medium text-gray-400 mb-1">Initial Capital ($)</label>
                    <input
                        type="number"
                        id="initial-capital"
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(Number(e.target.value))}
                        className={sharedInputStyles}
                    />
                </div>
                <div>
                    <label htmlFor="risk-percent" className="block text-sm font-medium text-gray-400 mb-1">Risk per Trade (%)</label>
                    <input
                        type="number"
                        id="risk-percent"
                        value={riskPercent}
                        onChange={(e) => setRiskPercent(Number(e.target.value))}
                        className={sharedInputStyles}
                        min="0.1"
                        step="0.1"
                    />
                </div>
            </div>

            {/* --- RESULTS SUMMARY --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white/5 p-4 rounded-lg">
                <ResultCard
                    label="Final Balance"
                    value={`$${finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <ResultCard
                    label="Total Return"
                    value={`${totalReturn.toFixed(2)}%`}
                    colorClass={totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}
                />
            </div>

            {/* --- EQUITY CHART --- */}
            <div className="h-[350px]">
                {simulationResults && simulationResults.length > 1 ? (
                    <EquityChart equityCurveData={simulationResults} timeUnit="day" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        {signals.length > 0 ? 'Run simulation to see results.' : 'Select a model with signal data to begin.'}
                    </div>
                )}
            </div>
        </div>
    );
};