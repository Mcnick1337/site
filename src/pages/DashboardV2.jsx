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

  const availableSymbols = useMemo(() => {
    const symbols = new Set(signals.map(s => s.symbol));
    return Array.from(symbols).sort();
  }, [signals]);

  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      const symbolMatch = !filters.symbol || signal.symbol.toLowerCase() === filters.symbol.toLowerCase();
      const directionMatch = !filters.direction || (signal.decision || signal.direction)?.toUpperCase() === filters.direction.toUpperCase();
      const confidenceMatch = (signal.confidence || signal.final_confidence) >= filters.minConfidence;
      return symbolMatch && directionMatch && confidenceMatch;
    });
  }, [signals, filters]);

  // --- ADDED: New stats calculation for the advanced model ---
  const advancedStats = useMemo(() => {
      if (modelConfig.advanced) {
          return calculateAllStatsV2_Advanced(filteredSignals);
      }
      return null;
  }, [modelConfig.advanced, filteredSignals]);

  const totalPages = Math.ceil(filteredSignals.length / itemsPerPage);
  const paginatedSignals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSignals.slice(startIndex, endIndex);
  }, [filteredSignals, currentPage, itemsPerPage]);

  if (isLoading && signals.length === 0) {
    return <div className="text-center p-8 animate-pulse text-gray-400">Loading AI PRO Data...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">AI PRO Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Next-Generation Signal Analysis</p>
      </div>
      
      <TabNav models={V2_MODELS} activeTab={activeV2Tab} setActiveTab={setActiveV2Tab} />
      
      <div className="mt-4">
        {modelConfig.advanced ? (
          <>
            {/* --- UPDATED: Use the new advanced components --- */}
            <StatsGridV2_Advanced stats={advancedStats} />
            <DetailsSectionV2_Advanced stats={advancedStats} />
            <FilterControlsV2 filters={filters} onFilterChange={(key, val) => onFilterChange(activeV2Tab, key, val)} availableSymbols={availableSymbols} />
            {paginatedSignals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {paginatedSignals.map((signal) => (
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
            <FilterControlsV2 filters={filters} onFilterChange={(key, val) => onFilterChange(activeV2Tab, key, val)} availableSymbols={availableSymbols} />
            {paginatedSignals.length > 0 ? (
              <SignalCatalogV2 signals={paginatedSignals} metrics={metrics} onSignalClick={onSelectSignalV2} />
            ) : (
              <EmptyState title="No Signals Found" message="Try adjusting your filters to find more results." />
            )}
          </>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => onPageChange(activeV2Tab, page)}
        />
      </div>
    </div>
  );
};