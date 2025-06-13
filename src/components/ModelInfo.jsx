// File: src/components/ModelInfo.jsx

import { useState } from 'react';
import { modelInfoData } from '../utils/modelData';

export const ModelInfo = ({ modelId, learningStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const info = modelInfoData[modelId];

    if (!info) return null;

    return (
        <div className="max-w-4xl mx-auto mb-6 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-3 font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 ${isOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
            >
                <span>About {info.title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 bg-white/5 border-x border-b border-white/10 rounded-b-lg">
                    {learningStatus && (
                        <div className="mb-4 p-3 bg-black/20 rounded-lg text-center">
                            <p className="text-sm text-gray-400">Performance Trend</p>
                            <p className={`text-lg font-bold ${learningStatus.color}`}>
                                {learningStatus.status}
                            </p>
                            <p className="text-xs text-gray-500">
                                (Regression Slope: {learningStatus.slope.toFixed(4)})
                            </p>
                        </div>
                    )}
                    <p className="text-gray-300 mb-3">{info.description}</p>
                    <h4 className="font-semibold text-white mb-2">Strengths:</h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                        {info.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};