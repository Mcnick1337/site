import { useState } from 'react';
import { modelInfoData } from '../utils/modelData';

export const ModelInfo = ({ modelId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const info = modelInfoData[modelId];

    if (!info) return null;

    return (
        <div className="max-w-4xl mx-auto mb-6 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                // UPDATED: Conditional border-radius makes it look like one element
                className={`w-full flex justify-between items-center p-3 font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 ${isOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
            >
                <span>About {info.title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {/* UPDATED: Smooth transition for max-height */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 bg-white/5 border-x border-b border-white/10 rounded-b-lg">
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