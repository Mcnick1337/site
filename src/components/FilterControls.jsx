// File: src/components/FilterControls.jsx (Updated)

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// Import the new custom component
import { CustomSelect } from './CustomSelect';

const sharedInputStyles = `
  w-full bg-transparent text-white rounded-md border-0 py-1.5 px-2.5 
  ring-1 ring-inset ring-white/20 
  focus:ring-2 focus:ring-inset focus:ring-cyan-500
`;

// Define the options for our dropdowns
const typeOptions = [
    { value: '', label: 'All' },
    { value: 'Buy', label: 'Buy' },
    { value: 'Sell', label: 'Sell' }
];

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'WIN', label: 'Win' },
    { value: 'LOSS', label: 'Loss' }
];

const sortOptions = [
    { value: 'timestamp', label: 'Date' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'symbol', label: 'Symbol' }
];

export const FilterControls = ({ modelId, filters, sort, onFilterChange, onSortChange }) => {
    return (
        // The z-index on this container is still important for the DatePicker
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 my-6 flex flex-wrap items-end gap-4">
            
            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`symbol-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
                <input
                    type="text" id={`symbol-filter-${modelId}`} placeholder="e.g., BTCUSDT"
                    value={filters.symbol} onChange={(e) => onFilterChange('symbol', e.target.value)}
                    className={sharedInputStyles}
                />
            </div>

            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`start-date-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                <DatePicker
                    id={`start-date-${modelId}`} selected={filters.startDate} onChange={(date) => onFilterChange('startDate', date)}
                    selectsStart startDate={filters.startDate} endDate={filters.endDate}
                    isClearable placeholderText="Anytime"
                    className={sharedInputStyles}
                />
            </div>

            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`end-date-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                <DatePicker
                    id={`end-date-${modelId}`} selected={filters.endDate} onChange={(date) => onFilterChange('endDate', date)}
                    selectsEnd startDate={filters.startDate} endDate={filters.endDate}
                    minDate={filters.startDate} isClearable placeholderText="Anytime"
                    className={sharedInputStyles}
                />
            </div>
            
            {/* --- REPLACED <select> with <CustomSelect> --- */}
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`type-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                <CustomSelect
                    id={`type-filter-${modelId}`}
                    value={filters.signalType}
                    onChange={(value) => onFilterChange('signalType', value)}
                    options={typeOptions}
                />
            </div>

            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`status-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <CustomSelect
                    id={`status-filter-${modelId}`}
                    value={filters.status}
                    onChange={(value) => onFilterChange('status', value)}
                    options={statusOptions}
                />
            </div>
            
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`sort-by-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <CustomSelect
                    id={`sort-by-${modelId}`}
                    value={sort.by}
                    onChange={(value) => onSortChange('by', value)}
                    options={sortOptions}
                />
            </div>
        </div>
    );
};