import { useState } from 'react';
import { calculateCorrelation } from '../utils/calculateStats';

export const ComparisonView = ({ appState, models, onExit }) => {
    const [modelA, setModelA] = useState(Object.keys(models)[0]);
    const [modelB, setModelB] = useState(Object.keys(models)[1]);
    
    let correlation = 'N/A';
    if(appState[modelA].allSignals.length > 0 && appState[modelB].allSignals.length > 0) {
        correlation = calculateCorrelation(appState[modelA].allSignals, appState[modelB].allSignals).toFixed(3);
    }
    
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Model Comparison</h2>
                <button onClick={onExit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-600 hover:bg-gray-500 transition-colors">
                    Exit View
                </button>
            </div>
            {/* Model selectors and stats comparison would go here */}
            <div className="text-center">
                <h3 className="text-xl font-bold">Tier 5: Correlation Score</h3>
                <p className="text-6xl font-bold text-amber-400 my-4">{correlation}</p>
                <p className="text-sm text-gray-400">Measures the tendency of the two models to make similar trades.<br/>(1 = identical, 0 = no relation, -1 = opposite)</p>
            </div>
        </div>
    );
};