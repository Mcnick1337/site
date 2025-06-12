// File: src/components/FilterControls.jsx

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// This constant defines the complete style for all select dropdowns
const selectStyles = `
  w-full rounded-md border-0 py-1.5 px-2.5 shadow-sm 
  bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-300
  focus:ring-2 focus:ring-inset focus:ring-cyan-500
  dark:bg-white/10 dark:text-white dark:ring-white/20
  appearance-none  /* This is the key to removing browser default styles */
  bg-no-repeat
  bg-[right_0.5rem_center]
  bg-[length:1.5em_1.5em]
  pr-10 /* Make space for the arrow */
  dark:bg-[url("data:image/svg+xml,%3csvg_xmlns='http://www.w3.org/2000/svg'_fill='none'_viewBox='0_0_20_20'%3e%3cpath_stroke='%239ca3af'_stroke-linecap='round'_stroke-linejoin='round'_stroke-width='1.5'_d='M6_8l4_4_4-4'/%3e%3c/svg%3e")]
  bg-[url("data:image/svg+xml,%3csvg_xmlns='http://www.w3.org/2000/svg'_fill='none'_viewBox='0_0_20_20'%3e%3cpath_stroke='%236b7280'_stroke-linecap='round'_stroke-linejoin='round'_stroke-width='1.5'_d='M6_8l4_4_4-4'/%3e%3c/svg%3e")]
`;

export const FilterControls = ({ modelId, filters, sort, onFilterChange, onSortChange }) => {
    return (
        <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-4 my-6 flex flex-wrap items-end gap-4">
            
            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`symbol-filter-${modelId}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Symbol</label>
                <input
                    type="text"
                    id={`symbol-filter-${modelId}`}
                    placeholder="e.g., BTCUSDT"
                    value={filters.symbol}
                    onChange={(e) => onFilterChange('symbol', e.target.value)}
                    className="w-full bg-gray-200 dark:bg-white/10 rounded-md border-0 py-1.5 px-2.5 text-gray-800 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-white/20 focus:ring-2 focus:ring-inset focus:ring-cyan-500 shadow-sm"
                />
            </div>

            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`start-date-${modelId}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <DatePicker
                    id={`start-date-${modelId}`}
                    selected={filters.startDate}
                    onChange={(date) => onFilterChange('startDate', date)}
                    selectsStart startDate={filters.startDate} endDate={filters.endDate}
                    isClearable placeholderText="Anytime"
                />
            </div>

            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`end-date-${modelId}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <DatePicker
                    id={`end-date-${modelId}`}
                    selected={filters.endDate}
                    onChange={(date) => onFilterChange('endDate', date)}
                    selectsEnd startDate={filters.startDate} endDate={filters.endDate}
                    minDate={filters.startDate} isClearable placeholderText="Anytime"
                />
            </div>
            
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`type-filter-${modelId}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                <select 
                    id={`type-filter-${modelId}`} 
                    value={filters.signalType} 
                    onChange={(e) => onFilterChange('signalType', e.target.value)} 
                    className={selectStyles.replace(/\s+/g, ' ').trim()}
                >
                    <option value="">All</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                </select>
            </div>

            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`status-filter-${modelId}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select 
                    id={`status-filter-${modelId}`} 
                    value={filters.status} 
                    onChange={(e) => onFilterChange('status', e.target.value)} 
                    className={selectStyles.replace(/\s+/g, ' ').trim()}
                >
                    <option value="">All</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                </select>
            </div>
            
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`sort-by-${modelId}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Sort By</label>
                <select 
                    id={`sort-by-${modelId}`} 
                    value={sort.by} 
                    onChange={(e) => onSortChange('by', e.target.value)} 
                    className={selectStyles.replace(/\s+/g, ' ').trim()}
                >
                    <option value="timestamp">Date</option>
                    <option value="confidence">Confidence</option>
                    <option value="symbol">Symbol</option>
                </select>
            </div>
        </div>
    );
};