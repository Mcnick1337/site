// File: src/components/charts/SymbolWinRates.jsx

export const SymbolWinRates = ({ rates }) => {
    if (!rates || rates.length === 0) {
        return <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center text-gray-400">No symbol data available.</div>;
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Performance by Symbol</h3>
            <div className="max-h-64 overflow-y-auto pr-2">
                {rates.map(item => (
                    <div key={item.symbol} className="flex justify-between items-center text-sm mb-2 pb-2 border-b border-white/10">
                        <span className="font-semibold">{item.symbol}</span>
                        <div className="text-right">
                            <span className={`font-bold ${item.winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.winRate.toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-400 ml-2">({item.wins}W / {item.losses}L)</span>
                            <span className="text-xs text-gray-500 ml-2">PF: {isFinite(item.profitFactor) ? item.profitFactor.toFixed(2) : 'N/A'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};