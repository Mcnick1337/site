// File: src/pages/DashboardV2.jsx

import React, { useMemo } from 'react';
import { SignalCatalogV2 } from '../components/V2/SignalCatalogV2';
import { FilterControlsV2 } from '../components/V2/FilterControlsV2';
import { StatsGridV2 } from '../components/V2/StatsGridV2';
import { Pagination } from '../components/Pagination';

export const DashboardV2 = ({ proModelState, setSelectedSignal, onFilterChange, onPageChange }) => {
    const { signals, metrics, isLoading, filters, currentPage, itemsPerPage } = proModelState;

    const availableSymbols = useMemo(() => {
        const symbols = new Set(signals.map(s => s.symbol));
        return Array.from(symbols).sort();
    }, [signals]);

    const filteredSignals = useMemo(() => {
        return signals.filter(signal => {
            const symbolMatch = !filters.symbol || signal.symbol.toLowerCase() === filters.symbol.toLowerCase();
            const directionMatch = !filters.direction || signal.direction.toUpperCase() === filters.direction.toUpperCase();
            const confidenceMatch = signal.final_confidence >= filters.minConfidence;
            return symbolMatch && directionMatch && confidenceMatch;
        });
    }, [signals, filters]);

    // --- ADDED: Pagination Logic ---
    const totalPages = Math.ceil(filteredSignals.length / itemsPerPage);
    const paginatedSignals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredSignals.slice(startIndex, endIndex);
    }, [filteredSignals, currentPage, itemsPerPage]);


    if (isLoading) {
        return <div className="text-center p-8 animate-pulse text-gray-400">Loading AI PRO Data...</div>;
    }
    
    if (!signals.length) {
        return <div className="text-center p-8 text-red-400">Could not load AI PRO signal data.</div>;
    }

    return (
        <div className="flex flex-col w-full">
            <div className="mb-6">
                <h1 className="text-4xl font-bold">AI PRO Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Next-Generation Signal Analysis</p>
            </div>
            
            {/* --- ADDED: The new V2 Stats Grid --- */}
            <StatsGridV2 metrics={metrics} />
            
            <FilterControlsV2 
                filters={filters}
                onFilterChange={onFilterChange}
                availableSymbols={availableSymbols}
            />

            <SignalCatalogV2 
                signals={paginatedSignals} 
                metrics={metrics}
                onSignalClick={setSelectedSignal}
            />

            {/* --- ADDED: The new Pagination Controls --- */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
};