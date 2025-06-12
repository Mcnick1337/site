// File: src/pages/PortfolioView.jsx

import { useState, useEffect } from 'react';
import { PortfolioSimulator } from '../components/simulation/PortfolioSimulator';
import { BacktestEngine } from '../components/simulation/BacktestEngine';
import { CustomSelect } from '../components/CustomSelect';

export const PortfolioView = ({ appState, models, activeTab, loadModelData }) => {
    const [selectedModel, setSelectedModel] = useState(activeTab);

    // Actively load data for the selected model if it's not already loaded
    useEffect(() => {
        if (selectedModel) {
            loadModelData(selectedModel);
        }
    }, [selectedModel, loadModelData]);

    const signals = appState[selectedModel]?.allSignals || [];
    const isLoading = appState[selectedModel]?.isLoading || false;

    const modelOptions = Object.entries(models).map(([id, { name }]) => ({
        value: id,
        label: name,
    }));

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">Portfolio & Strategy Tools</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="model-selector" className="text-sm font-medium text-gray-400 flex-shrink-0">Analyse Model:</label>
                    <div className="w-full sm:w-48">
                        <CustomSelect
                            id="model-selector"
                            value={selectedModel}
                            onChange={setSelectedModel}
                            options={modelOptions}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-96 bg-white/5 rounded-2xl">
                        <p className="text-gray-400 animate-pulse">Loading Model Data...</p>
                    </div>
                ) : (
                    <>
                        <PortfolioSimulator signals={signals} />
                        <BacktestEngine signals={signals} />
                    </>
                )}
            </div>
        </div>
    );
};