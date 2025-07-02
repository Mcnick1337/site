// File: src/components/v2/SignalCardV2_Advanced.jsx

import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Accordion } from './Accordion'; // Import the new Accordion component

const Stat = ({ label, value, valueClass = '' }) => (
    <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
);

export const SignalCardV2_Advanced = ({ signal }) => {
    const isLong = signal.decision.toUpperCase() === 'LONG';
    const { trade_parameters: params } = signal;

    // --- THE FIX: Defensively check for arrays, provide empty array as fallback ---
    const confluenceFactors = Array.isArray(signal.ai_confluence) ? signal.ai_confluence : [];
    const counterFactors = Array.isArray(signal.ai_counters) ? signal.ai_counters : [];

    return (
        <div className="bg-dark-card/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 h-full flex flex-col text-left">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${isLong ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {signal.decision}
                        </span>
                        <h3 className="text-lg font-bold text-white">{signal.symbol}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(signal.timestamp_utc).toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="text-lg font-bold text-cyan-400">{`${(signal.confidence * 100).toFixed(0)}%`}</p>
                </div>
            </div>

            <div className="my-3 grid grid-cols-3 gap-2 border-y border-white/10 py-2">
                <Stat label="Entry" value={params.entry_price.toFixed(2)} />
                <Stat label="Take Profit" value={params.take_profit.toFixed(2)} valueClass="text-green-400" />
                <Stat label="Stop Loss" value={params.stop_loss.toFixed(2)} valueClass="text-red-400" />
            </div>

            <div className="text-xs text-gray-400 leading-relaxed mb-3">
                <span className="font-bold text-gray-300">AI Reasoning: </span>{signal.ai_reasoning}
            </div>

            {/* --- THE UI FIX: Replaced static lists with interactive accordions --- */}
            <div className="flex-grow space-y-2 text-sm">
                <Accordion 
                    title="Confluence" 
                    titleColor="text-green-400"
                    icon={<CheckIcon className="h-5 w-5" />}
                >
                    <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2 text-xs">
                        {confluenceFactors.length > 0 ? (
                            confluenceFactors.map((item, index) => <li key={index}>{item}</li>)
                        ) : (
                            <li>No confluence factors provided.</li>
                        )}
                    </ul>
                </Accordion>
                <Accordion 
                    title="Counters"
                    titleColor="text-red-400"
                    icon={<XMarkIcon className="h-5 w-5" />}
                >
                     <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2 text-xs">
                        {counterFactors.length > 0 ? (
                            counterFactors.map((item, index) => <li key={index}>{item}</li>)
                        ) : (
                            <li>No counter factors provided.</li>
                        )}
                    </ul>
                </Accordion>
            </div>
        </div>
    );
};