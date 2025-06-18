// File: src/components/SignalCard.jsx

import { useState, useEffect } from 'react';
import { NotesIcon } from './icons/NotesIcon';

const getConfidenceClass = (confidence) => {
    if (confidence >= 85) return 'shadow-glow-cyan border-cyan-500';
    if (confidence >= 70) return 'shadow-glow-blue border-blue-500';
    return 'border-white/20';
};

export const SignalCard = ({ signal, onClick, isHighlighted, index }) => {
    const [hasNote, setHasNote] = useState(false);

    // Check for a note in localStorage when the component mounts or the signal changes.
    useEffect(() => {
        const note = localStorage.getItem(`note_${signal.timestamp}`);
        setHasNote(!!note);
    }, [signal.timestamp]);

    // This allows the card to update if a note is changed in the modal.
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === `note_${signal.timestamp}`) {
                setHasNote(!!e.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [signal.timestamp]);

    return (
        <div
            onClick={onClick}
            className={`bg-dark-card p-4 rounded-lg border cursor-pointer 
                        transition-[transform,box-shadow,border-color] duration-300 ease-in-out
                        card-enter relative
                        ${getConfidenceClass(signal.Confidence)}
                        ${isHighlighted ? 'transform scale-105 bg-cyan-900/50' : 'hover:-translate-y-1'}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg">{signal.symbol}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${signal.Signal === 'Buy' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {signal.Signal}
                </span>
            </div>
            <div className="text-sm space-y-2 text-gray-300">
                <div className="flex justify-between"><span>Confidence:</span> <span className="font-semibold text-white">{signal.Confidence || 'N/A'}%</span></div>
                <div className="flex justify-between">
                    <span>Status:</span> 
                    <span className="font-semibold text-white">{signal.performance?.status || 'Pending'}</span>
                </div>
            </div>
            <div className="flex justify-between items-center mt-3">
                {hasNote ? (
                    <NotesIcon className="h-4 w-4 text-amber-400" />
                ) : (
                    <div /> // Empty div to maintain layout
                )}
                <div className="text-xs text-gray-500 text-right">{new Date(signal.timestamp).toLocaleString()}</div>
            </div>
        </div>
    );
};
