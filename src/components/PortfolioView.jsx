import { useState } from 'react';
import { PortfolioSimulator } from './simulation/PortfolioSimulator';
import { BacktestEngine } from './simulation/BacktestEngine';

const AI_MODELS_META = {
    'ai-max': { name: 'AI Max' },
    'ai-bob': { name: 'AI Bob' },
    'ai-bob-2': { name: 'AI Bob-2 (Exp)' },
    'ai-bob-3': { name: 'AI Bob-3 (Exp)' },
};

export const PortfolioView = ({ appState, activeTab }) => {
    // State to manage which model is selected ON THIS PAGE
    const [selectedModel, setSelectedModel] = useState(activeTab);

    // Get the signals for the currently selected model
    const signals = appState[selectedModel]?.allSignals || [];

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Portfolio & Strategy Tools</h2>
                {/* THE NEW FEATURE: Dropdown to select the AI model */}
                <div className="flex items-center gap-2">
                    <label htmlFor="model-selector" className="text-sm font-medium text-gray-400">Analyse Model:</label>
                    <select
                        id="model-selector"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-dark-card rounded-md border-0 py-1.5 px-3 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    >
                        {Object.entries(AI_MODELS_META).map(([id, { name }]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-8">
                {/* Pass the correct signals array to the components */}
                <PortfolioSimulator signals={signals} />
                <BacktestEngine allSignals={signals} />
            </div>
        </div>
    );
};