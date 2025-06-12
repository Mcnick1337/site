// File: src/components/ComparisonView.jsx (Updated to trigger data loading)

import { useState, useMemo, useEffect } from 'react';
import { calculateCorrelation, calculateAllStats } from '../utils/calculateStats';
import { CustomSelect } from './CustomSelect';
import { ComparisonColumn } from './ComparisonColumn';

const ModelDataWrapper = ({ modelId, appState, children }) => {
    const modelData = appState[modelId];

    const fullModelData = useMemo(() => {
        // Only calculate stats if data is loaded and not empty
        if (!modelData || modelData.allSignals.length === 0 || modelData.isLoading) return null;
        const overallStats = calculateAllStats(modelData.allSignals);
        return { ...modelData, overallStats, equityCurveData: overallStats.equityCurveData };
    }, [modelData]);
    
    // --- UPDATED: Now checks the per-model loading flag ---
    if (modelData.isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-white/5 rounded-2xl p-6 animate-pulse">
                <p className="text-gray-400">Loading Model Data...</p>
            </div>
        );
    }

    if (!fullModelData) {
         return (
            <div className="flex items-center justify-center h-full bg-white/5 rounded-2xl p-6">
                <p className="text-gray-500">No data to display.</p>
            </div>
        );
    }

    return children(fullModelData);
};

export const ComparisonView = ({ appState, models, onExit, loadModelData }) => {
    const modelKeys = Object.keys(models);
    const [modelA, setModelA] = useState(modelKeys[0]);
    const [modelB, setModelB] = useState(modelKeys.length > 1 ? modelKeys[1] : modelKeys[0]);

    // --- ADDED: useEffect to trigger data loading for selected models ---
    useEffect(() => {
        if (modelA) loadModelData(modelA);
        if (modelB) loadModelData(modelB);
    }, [modelA, modelB, loadModelData]);


    const modelOptions = modelKeys.map(id => ({ value: id, label: models[id].name }));

    const correlation = useMemo(() => {
        if (!appState[modelA] || !appState[modelB] || appState[modelA].allSignals.length === 0 || appState[modelB].allSignals.length === 0) {
            return 'N/A';
        }
        return calculateCorrelation(appState[modelA].allSignals, appState[modelB].allSignals).toFixed(3);
    }, [appState, modelA, modelB]);
    
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Model Comparison</h2>
                <button onClick={onExit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-600 hover:bg-gray-500 transition-colors">
                    Exit View
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Model A</label>
                    <CustomSelect 
                        value={modelA}
                        onChange={setModelA}
                        options={modelOptions.filter(opt => opt.value !== modelB)}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Model B</label>
                    <CustomSelect 
                        value={modelB}
                        onChange={setModelB}
                        options={modelOptions.filter(opt => opt.value !== modelA)}
                    />
                </div>
            </div>

            <div className="text-center bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold">Correlation Score</h3>
                <p className="text-6xl font-bold text-amber-400 my-4">{correlation}</p>
                <p className="text-sm text-gray-400">Measures the tendency of the two models to make similar trades.<br/>(1 = identical, 0 = no relation, -1 = opposite)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModelDataWrapper modelId={modelA} appState={appState}>
                    {(data) => <ComparisonColumn modelData={data} />}
                </ModelDataWrapper>

                <ModelDataWrapper modelId={modelB} appState={appState}>
                    {(data) => <ComparisonColumn modelData={data} />}
                </ModelDataWrapper>
            </div>
        </div>
    );
};