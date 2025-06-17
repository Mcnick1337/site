// File: src/components/v2/SignalCardV2.jsx

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';

const Stat = ({ label, value, valueClass = '' }) => (
    <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
);

// --- UPDATED: Component now accepts an onClick prop ---
export const SignalCardV2 = ({ signal, metrics, onClick }) => {
    const isLong = signal.direction.toUpperCase() === 'LONG';
    const symbolMetrics = metrics[signal.symbol]?.[signal.direction.toUpperCase()] || { wins: 0, losses: 0, total: 0 };
    const winRate = symbolMetrics.total > 0 ? (symbolMetrics.wins / symbolMetrics.total) * 100 : 0;

    return (
        // --- UPDATED: The whole container is now a clickable button ---
        <button 
            onClick={onClick}
            className="w-full text-left bg-dark-card/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/10"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${isLong ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {signal.direction}
                        </span>
                        <h3 className="text-lg font-bold text-white">{signal.symbol}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(signal.timestamp).toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="text-lg font-bold text-cyan-400">{`${(signal.final_confidence * 100).toFixed(0)}%`}</p>
                </div>
            </div>

            <div className="my-4 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
                <Stat label="Entry" value={signal.entry.toFixed(2)} />
                <Stat label="Take Profit" value={signal.take_profit.toFixed(2)} valueClass="text-green-400" />
                <Stat label="Stop Loss" value={signal.stop_loss.toFixed(2)} valueClass="text-red-400" />
                <Stat label="Leverage" value={`${signal.final_leverage}x`} />
                <Stat label="R:R Ratio" value={signal.rr_ratio.toFixed(2)} />
                <Stat label="Win Rate" value={`${winRate.toFixed(1)}%`} valueClass={winRate >= 50 ? 'text-green-400' : 'text-amber-400'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckIcon className="h-5 w-5" />
                        Confluence Factors
                    </h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2 text-xs">
                        {signal.ai_confluence.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <XMarkIcon className="h-5 w-5" />
                        Counter Factors
                    </h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2 text-xs">
                        {signal.ai_counters.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="font-bold text-gray-300">AI Summary: </span>{signal.ai_summary}
                </p>
            </div>
        </button>
    );
};