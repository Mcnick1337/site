// File: src/components/FilterControls.jsx

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export const FilterControls = ({ modelId, filters, sort, onFilterChange, onSortChange }) => {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 my-6 flex flex-wrap items-end gap-4">
            {/* Symbol Filter */}
            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`symbol-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
                <input /* ... (input props) ... */ />
            </div>

            {/* --- Date Range Filters --- */}
            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`start-date-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                <DatePicker
                    id={`start-date-${modelId}`}
                    selected={filters.startDate}
                    onChange={(date) => onFilterChange('startDate', date)}
                    selectsStart
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    isClearable
                    placeholderText="Anytime"
                />
            </div>
            <div className="flex-grow min-w-[120px]">
                <label htmlFor={`end-date-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                <DatePicker
                    id={`end-date-${modelId}`}
                    selected={filters.endDate}
                    onChange={(date) => onFilterChange('endDate', date)}
                    selectsEnd
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    minDate={filters.startDate}
                    isClearable
                    placeholderText="Anytime"
                />
            </div>
            
            {/* Type Filter */}
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`type-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                <select /* ... (select props) ... */ />
            </div>

            {/* Status Filter */}
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`status-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select /* ... (select props) ... */ />
            </div>
            
            {/* Sort By */}
            <div className="flex-grow min-w-[100px]">
                <label htmlFor={`sort-by-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <select /* ... (select props) ... */ />
            </div>
        </div>
    );
};