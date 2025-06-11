import { useState } from 'react';
import { calculateCompoundingEquityCurve } from '../../utils/calculateStats';
import { EquityChart } from '../charts/EquityChart';

export const PortfolioSimulator = ({ signals }) => {
    const [config, setConfig] = useState({ capital: 10000, risk: 1, showChart: false });
    const [simulatedData, setSimulatedData] = useState(null);
    const [finalValue, setFinalValue] = useState(0);

    const handleRunSimulation = () => {
        if (signals.length === 0) {
            alert("No signal data loaded to run simulation.");
            return;
        }
        const data = calculateCompoundingEquityCurve(signals, config.capital, config.risk);
        setSimulatedData(data);
        setFinalValue(data[data.length - 1]?.y || 0);
        setConfig(prev => ({ ...prev, showChart: true }));
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Portfolio Simulation</h3>
            <p className="text-sm text-gray-400 mb-4">
                Simulate portfolio growth with compounding returns based on a fixed risk percentage per trade.
            </p>
            <div className="flex flex-wrap items-end gap-4 mb-4">
                <div>
                    <label htmlFor="initialCapital" className="block text-xs font-medium text-gray-400">Initial Capital</label>
                    <input
                        type="number"
                        id="initialCapital"
                        value={config.capital}
                        onChange={e => setConfig({ ...config, capital: Number(e.target.value) })}
                        className="w-full bg-white/10 rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="riskPercent" className="block text-xs font-medium text-gray-400">Risk per Trade (%)</label>
                    <input
                        type="number"
                        id="riskPercent"
                        value={config.risk}
                        onChange={e => setConfig({ ...config, risk: Number(e.target.value) })}
                        className="w-full bg-white/10 rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    />
                </div>
                <button onClick={handleRunSimulation} className="bg-cyan-600 hover:bg-cyan-500 rounded-md py-2 px-4 font-semibold transition h-fit">
                    Run Simulation
                </button>
            </div>
            {config.showChart && simulatedData && (
                <div className="mt-6">
                    <p className="text-lg font-semibold">
                        Final Portfolio Value: 
                        <span className="text-green-400 ml-2">
                            ${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </p>
                    {/* Pass the timeUnit prop to fix the timeline */}
                    <EquityChart equityCurveData={simulatedData} timeUnit="day" />
                </div>
            )}
        </div>
    );
};