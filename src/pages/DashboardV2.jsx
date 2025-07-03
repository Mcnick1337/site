// File: src/pages/DashboardV2.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { V2_MODELS } from '../App';
import { TabNav } from '../components/TabNav';
import { SignalCatalogV2 } from '../components/V2/SignalCatalogV2';
import { SignalCardV2_Advanced } from '../components/V2/SignalCardV2_Advanced';
import { FilterControlsV2 } from '../components/V2/FilterControlsV2';
import { StatsGridV2 } from '../components/V2/StatsGridV2';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { StatsGridV2_Advanced } from '../components/V2/StatsGridV2_Advanced';
import { DetailsSectionV2_Advanced } from '../components/V2/DetailsSectionV2_Advanced';
import { calculateAllStatsV2_Advanced } from '../utils/calculateStats';

export const DashboardV2 = ({
  v2ModelsState,
  onSelectSignalV2,
  onSelectSignalV2Advanced,
  onFilterChange,
  onPageChange,
  loadV2ModelData
}) => {
  const [activeV2Tab, setActiveV2Tab] = useState(Object.keys(V2_MODELS)[0]);

  useEffect(() => {
    loadV2ModelData(activeV2Tab);
  }, [activeV2Tab, loadV2ModelData]);

  const currentModelState = v2ModelsState[activeV2Tab];
  const { signals, metrics, isLoading, filters, currentPage, itemsPerPage } = currentModelState;
  const modelConfig = V2_MODELS[activeV2Tab];

  // --- THE FIX IS HERE: All data processing is now inside a single, dependent useMemo ---
  const processedData = useMemo(() => {
    if (!signals || signals.length === 0) {
      return {
        availableSymbols: [],
        filteredSignals: [],
        advancedStats: null,
        totalPages: 0,
        paginatedSignals: [],
      };
    }

    const availableSymbols = Array.from(new Set(signals.map(s => s.symbol))).sort();

    const filteredSignals = signals.filter(signal => {
      const symbolMatch = !filters.symbol || signal.symbol.toLowerCase() === filters.symbol.toLowerCase();
      const directionMatch = !filters.direction || (signal.decision || signal.direction)?.toUpperCase() === filters.direction.toUpperCase();
      const confidenceMatch = (signal.confidence || signal.final_confidence) >= filters.minConfidence;
      return symbolMatch && directionMatch && confidenceMatch;
    });

    const advancedStats = modelConfig.advanced ? calculateAllStatsV2_Advanced(filteredSignals) : null;

    const totalPages = Math.ceil(filteredSignals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSignals = filteredSignals.slice(startIndex, endIndex);

    return { availableSymbols, filteredSignals, advancedStats, totalPages, paginatedSignals };

  }, [signals, filters, modelConfig, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">AI PRO Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Next-Generation Signal Analysis</p>
      </div>
      
      <TabNav models={V2_MODELS} activeTab={activeV2Tab} setActiveTab={setActiveV2Tab} />
      
      <div className="mt-4">
        {isLoading && signals.length === 0 ? (
          <div className="text-center p-8 animate-pulse text-gray-400">Loading AI PRO Data...</div>
        ) : (
          <>
            {modelConfig.advanced ? (
              <>
                <StatsGridV2_Advanced stats={processedData.advancedStats} />
                <DetailsSectionV2_Advanced stats={processedData.advancedStats} />
                <FilterControlsV2 filters={filters} onFilterChange={(key, val) => onFilterChange(activeV2Tab, key, val)} availableSymbols={processedData.availableSymbols} />
                {processedData.paginatedSignals.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {processedData.paginatedSignals.map((signal) => (
                      <div key={signal.timestamp_utc} className="card-enter">
                        <div
                          onClick={() => onSelectSignalV2Advanced(signal)}
                          className="w-full h-full cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectSignalV2Advanced(signal)}
                        >
                          <SignalCardV2_Advanced signal={signal} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No Signals Found" message="Try adjusting your filters to find more results." />
                )}
              </>
            ) : (
              <>
                <StatsGridV2 metrics={metrics} />
                <FilterControlsV2 filters={filters} onFilterChange={(key, val) => onFilterChange(activeV2Tab, key, val)} availableSymbols={processedData.availableSymbols} />
                {processedData.paginatedSignals.length > 0 ? (
                  <SignalCatalogV2 signals={processedData.paginatedSignals} metrics={metrics} onSignalClick={onSelectSignalV2} />
                ) : (
                  <EmptyState title="No Signals Found" message="Try adjusting your filters to find more results." />
                )}
              </>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={processedData.totalPages}
              onPageChange={(page) => onPageChange(activeV2Tab, page)}
            />
          </>
        )}
      </div>
    </div>
  );
};