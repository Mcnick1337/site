// File: src/components/FilterControls.jsx

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CustomSelect } from './CustomSelect';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const sharedInputStyles = `
  w-full bg-transparent text-white rounded-md border-0 py-1.5 px-3 
  ring-1 ring-inset ring-white/20 
  focus:ring-2 focus:ring-inset focus:ring-cyan-500
`;

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

const previousSignalStatusOptions = [
    { value: '', label: 'Any' },
    { value: 'WIN', label: 'After a Win' },
    { value: 'LOSS', label: 'After a Loss' }
];

// --- UPDATED: Added 'topSignals' to the sort options ---
const sortOptions = [
    { value: 'timestamp', label: 'Date' },
    { value: 'topSignals', label: 'Top Signals' }, // The new option
    { value: 'confidence', label: 'Confidence' },
    { value: 'symbol', label: 'Symbol' }
];

export const FilterControls = ({ modelId, filters, sort, onFilterChange, onSortChange, availableSymbols = [] }) => {
    const [symbolQuery, setSymbolQuery] = useState('');

    const filteredSymbols = symbolQuery === ''
        ? availableSymbols
        : availableSymbols.filter(symbol =>
            symbol.toLowerCase().includes(symbolQuery.toLowerCase())
          );

    return (
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 my-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-grow min-w-[120px]">
                    <label htmlFor={`symbol-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
                    <Combobox value={filters.symbol} onChange={(value) => onFilterChange('symbol', value)}>
                        <div className="relative">
                            <Combobox.Input
                                id={`symbol-filter-${modelId}`}
                                className={sharedInputStyles}
                                placeholder="e.g., BTCUSDT"
                                onChange={(event) => setSymbolQuery(event.target.value)}
                                onBlur={() => setSymbolQuery('')}
                                autoComplete="off"
                            />
                            <Transition as="div" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setSymbolQuery('')}>
                                <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {filteredSymbols.length === 0 && symbolQuery !== '' ? (
                                        <div className="relative cursor-default select-none py-2 px-4 text-gray-500">Nothing found.</div>
                                    ) : (
                                        filteredSymbols.slice(0, 100).map(symbol => (
                                            <Combobox.Option key={symbol} value={symbol} className={({ active }) => `relative cursor-default select-none py-2 px-4 transition-colors duration-150 ${active ? 'bg-cyan-600/50 text-white' : 'text-gray-300'}`}>{symbol}</Combobox.Option>
                                        ))
                                    )}
                                </Combobox.Options>
                            </Transition>
                        </div>
                    </Combobox>
                </div>

                <div className="flex-grow min-w-[120px]">
                    <label htmlFor={`start-date-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                    <DatePicker id={`start-date-${modelId}`} selected={filters.startDate} onChange={(date) => onFilterChange('startDate', date)} selectsStart startDate={filters.startDate} endDate={filters.endDate} isClearable placeholderText="Anytime" className={sharedInputStyles} />
                </div>

                <div className="flex-grow min-w-[120px]">
                    <label htmlFor={`end-date-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                    <DatePicker id={`end-date-${modelId}`} selected={filters.endDate} onChange={(date) => onFilterChange('endDate', date)} selectsEnd startDate={filters.startDate} endDate={filters.endDate} minDate={filters.startDate} isClearable placeholderText="Anytime" className={sharedInputStyles} />
                </div>
                
                <div className="flex-grow min-w-[100px]">
                    <label htmlFor={`type-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <CustomSelect id={`type-filter-${modelId}`} value={filters.signalType} onChange={(value) => onFilterChange('signalType', value)} options={typeOptions} />
                </div>

                <div className="flex-grow min-w-[100px]">
                    <label htmlFor={`status-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <CustomSelect id={`status-filter-${modelId}`} value={filters.status} onChange={(value) => onFilterChange('status', value)} options={statusOptions} />
                </div>
                
                <div className="flex-grow min-w-[100px]">
                    <label htmlFor={`prev-status-filter-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Previous Signal</label>
                    <CustomSelect id={`prev-status-filter-${modelId}`} value={filters.previousSignalStatus} onChange={(value) => onFilterChange('previousSignalStatus', value)} options={previousSignalStatusOptions} />
                </div>

                <div className="flex-grow min-w-[100px]">
                    <label htmlFor={`sort-by-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                    <CustomSelect id={`sort-by-${modelId}`} value={sort.by} onChange={(value) => onSortChange('by', value)} options={sortOptions} />
                </div>
            </div>
            
            <div className="w-full pt-2 border-t border-white/10">
                 <label htmlFor={`reasoning-search-${modelId}`} className="block text-sm font-medium text-gray-400 mb-1">Search AI Reasoning</label>
                 <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id={`reasoning-search-${modelId}`}
                        className={`${sharedInputStyles} pl-10`}
                        placeholder="e.g., 'MACD crossover' or 'high volume breakout'"
                        value={filters.reasoningSearch || ''}
                        onChange={(e) => onFilterChange('reasoningSearch', e.target.value)}
                    />
                 </div>
            </div>
        </div>
    );
};