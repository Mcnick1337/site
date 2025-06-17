// File: src/components/v2/FilterControlsV2.jsx

import React, { useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CustomSelect } from '../CustomSelect'; // Reusing the V1 CustomSelect

const sharedInputStyles = `
  w-full bg-transparent text-white rounded-md border-0 py-1.5 px-3 
  ring-1 ring-inset ring-white/20 
  focus:ring-2 focus:ring-inset focus:ring-cyan-500
`;

const directionOptions = [
    { value: '', label: 'All Directions' },
    { value: 'LONG', label: 'Long' },
    { value: 'SHORT', label: 'Short' }
];

export const FilterControlsV2 = ({ filters, onFilterChange, availableSymbols }) => {
    const [symbolQuery, setSymbolQuery] = useState('');

    const filteredSymbols = symbolQuery === ''
        ? availableSymbols
        : availableSymbols.filter(symbol =>
            symbol.toLowerCase().includes(symbolQuery.toLowerCase())
          );

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 my-6 flex flex-col md:flex-row flex-wrap items-end gap-6">
            <div className="flex-grow w-full md:w-auto min-w-[150px]">
                <label htmlFor="symbol-filter-v2" className="block text-sm font-medium text-gray-400 mb-1">Symbol</label>
                <Combobox value={filters.symbol} onChange={(value) => onFilterChange('symbol', value)}>
                    <div className="relative">
                        <Combobox.Input
                            id="symbol-filter-v2"
                            className={sharedInputStyles}
                            placeholder="e.g., BTCUSDT"
                            onChange={(event) => setSymbolQuery(event.target.value)}
                            onBlur={() => setSymbolQuery('')}
                            autoComplete="off"
                        />
                        <Transition as="div" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setSymbolQuery('')}>
                            <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredSymbols.map(symbol => (
                                    <Combobox.Option key={symbol} value={symbol} className={({ active }) => `relative cursor-default select-none py-2 px-4 transition-colors duration-150 ${active ? 'bg-cyan-600/50 text-white' : 'text-gray-300'}`}>{symbol}</Combobox.Option>
                                ))}
                            </Combobox.Options>
                        </Transition>
                    </div>
                </Combobox>
            </div>

            <div className="flex-grow w-full md:w-auto min-w-[150px]">
                <label htmlFor="direction-filter-v2" className="block text-sm font-medium text-gray-400 mb-1">Direction</label>
                <CustomSelect id="direction-filter-v2" value={filters.direction} onChange={(value) => onFilterChange('direction', value)} options={directionOptions} />
            </div>

            <div className="flex-grow w-full md:w-auto min-w-[200px]">
                <label htmlFor="confidence-filter-v2" className="block text-sm font-medium text-gray-400 mb-1">Min Confidence: <span className="font-bold text-cyan-400">{(filters.minConfidence * 100).toFixed(0)}%</span></label>
                <input
                    id="confidence-filter-v2"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={filters.minConfidence}
                    onChange={(e) => onFilterChange('minConfidence', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
};