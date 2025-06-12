// File: src/components/DashboardView.jsx

import { useMemo } from 'react';
import { TabNav } from './TabNav';
import { ModelInfo } from './ModelInfo';
import { StatsGrid } from './StatsGrid';
import { DetailsSectionDashboard } from './DetailsSectionDashboard';
import { FilterControls } from './FilterControls';
import { SignalCatalog } from './SignalCatalog';
import { processSignals } from '../utils/processSignals';
import { calculateAllStats, calculateTimeBasedStats, calculateSymbolWinRates, calculateWeeklyStats } from '../utils/calculateStats';

// This is the full, correct component definition
export const DashboardView = ({
    models, activeTab, setActiveTab, appState,
    handleStateChange, handlePageChange, setSelectedSignal,
    highlightedSignalId, onSignalHover, setComparisonViewActive
}) => {
    // Get the data for the currently active tab from the main app state
    const currentModelData = appState[activeTab];

    // Step 1: Filter the raw signals based on the selected date range.
    // This is the primary filter that affects all calculations.
    const dateFilteredSignals = useMemo(() => {
        const { startDate, endDate } = currentModelData.filters;
        if (!startDate && !endDate) {
            return currentModelData.allSignals; // No date filter applied
        }
        return currentModelData.allSignals.filter(s => {
            if (!s.timestamp) return false; // Guard against signals with no timestamp
            const signalDate = new Date(s.timestamp);
            if (isNaN(signalDate.getTime())) return false; // Guard against invalid dates
            
            const startMatch = !startDate || signalDate >= startDate;
            const endMatch = !endDate || signalDate <= endDate;
            return startMatch && endMatch;
        });
    }, [currentModelData.allSignals, currentModelData.filters.startDate, currentModelData.filters.endDate]);

    // Step 2: Recalculate all statistics using ONLY the date-filtered signals.
    const statsForDisplay = useMemo(() => {
        const overallStats = calculateAllStats(dateFilteredSignals);
        const timeStats = calculateTimeBasedStats(dateFilteredSignals);
        const weeklyStats = calculateWeeklyStats(dateFilteredSignals);
        const symbolWinRates = calculateSymbolWinRates(dateFilteredSignals);
        return {
            overallStats,
            dayOfWeekStats: timeStats.dayStats,
            hourOfDayStats: timeStats.hourStats,
            weeklyStats,
            symbolWinRates,
            equityCurveData: overallStats.equityCurveData,
        };
    }, [dateFilteredSignals]);

    // Step 3: Apply the other filters (symbol, type, etc.) for the Signal Catalog view.
    const displayedSignals = useMemo(() => {
        // Pass the already date-filtered signals to be processed further.
        return processSignals(dateFilteredSignals, currentModelData.filters, currentModelData.sort);
    }, [dateFilteredSignals, currentModelData.filters, currentModelData.sort]);

    return (
        <>
            <TabNav
                models={models}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCompareClick={() => setComparisonViewActive(true)}
            />
            <ModelInfo modelId={activeTab} />
            
            {/* Pass the newly calculated stats to the widgets */}
            <StatsGrid stats={statsForDisplay.overallStats} />
            
            <DetailsSectionDashboard
                modelId={activeTab}
                // We construct a temporary object that mimics the structure `DetailsSectionDashboard` expects.
                appState={{ [activeTab]: statsForDisplay }}
                onSignalHover={onSignalHover}
            />
            
            <FilterControls
                modelId={activeTab}
                filters={currentModelData.filters}
                sort={currentModelData.sort}
                onFilterChange={(key, value) => handleStateChange('filters', key, value)}
                onSortChange={(key, value) => handleStateChange('sort', key, value)}
            />
            
            <SignalCatalog
                signals={displayedSignals}
                currentPage={currentModelData.currentPage}
                itemsPerPage={currentModelData.itemsPerPage}
                onPageChange={handlePageChange}
                onSignalClick={setSelectedSignal}
                highlightedSignalId={highlightedSignalId}
            />
        </>
    );
};