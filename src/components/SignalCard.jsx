const getConfidenceClass = (confidence) => {
    if (confidence >= 85) return 'shadow-glow-cyan border-cyan-500';
    if (confidence >= 70) return 'shadow-glow-blue border-blue-500';
    return 'border-white/20';
};

// UPDATED: Added index prop for staggered animation
export const SignalCard = ({ signal, onClick, isHighlighted, index }) => (
    <div
        onClick={onClick}
        className={`bg-dark-card p-4 rounded-lg border cursor-pointer 
                    transition-[transform,box-shadow,border-color] duration-300 ease-in-out
                    card-enter
                    ${getConfidenceClass(signal.Confidence)}
                    ${isHighlighted ? 'transform scale-105 bg-cyan-900/50' : 'hover:-translate-y-1'}`}
        // NEW: Apply animation delay based on index
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-lg">{signal.symbol}</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${signal.Signal === 'Buy' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {signal.Signal}
            </span>
        </div>
        <div className="text-sm space-y-2 text-gray-300">
            <div className="flex justify-between"><span>Confidence:</span> <span className="font-semibold text-white">{signal.Confidence}%</span></div>
            <div className="flex justify-between"><span>Status:</span> <span className="font-semibold text-white">{signal.performance.status}</span></div>
        </div>
        <div className="text-xs text-gray-500 mt-3 text-right">{new Date(signal.timestamp).toLocaleString()}</div>
    </div>
);