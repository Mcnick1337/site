export const FilterControls = ({ modelId, filters, sort, onFilterChange, onSortChange }) => {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 my-6 flex flex-wrap items-end gap-4">
            <div className="flex-grow">
                <label htmlFor={`symbol-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
                <input
                    type="text"
                    id={`symbol-filter-${modelId}`}
                    placeholder="e.g., BTCUSDT"
                    value={filters.symbol}
                    onChange={(e) => onFilterChange('symbol', e.target.value)}
                    className="w-full bg-white/10 rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                />
            </div>
            {/* Repeat for other filters */}
            <div className="flex-grow">
                <label htmlFor={`type-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                <select id={`type-filter-${modelId}`} value={filters.signalType} onChange={(e) => onFilterChange('signalType', e.target.value)} className="w-full bg-dark-card rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500">
                    <option value="">All</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                </select>
            </div>
            <div className="flex-grow">
                <label htmlFor={`status-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select id={`status-filter-${modelId}`} value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full bg-dark-card rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500">
                    <option value="">All</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                </select>
            </div>
            <div className="flex-grow">
                <label htmlFor={`sort-by-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <select id={`sort-by-${modelId}`} value={sort.by} onChange={(e) => onSortChange('by', e.target.value)} className="w-full bg-dark-card rounded-md border-0 py-1.5 px-2.5 text-white ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500">
                    <option value="timestamp">Date</option>
                    <option value="confidence">Confidence</option>
                    <option value="symbol">Symbol</option>
                </select>
            </div>
        </div>
    );
};