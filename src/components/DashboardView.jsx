// File: src/pages/DashboardView.jsx (Updated for polish)

import { useMemo } from 'react';
import { TabNav } from '../components/TabNav';
import { ModelInfo } from '../components/ModelInfo';
import { StatsGrid } from '../components/StatsGrid';
import { DetailsSectionDashboard } from '../components/DetailsSectionDashboard';
import { FilterControls } from '../components/FilterControls';
import { SignalCatalog } from '../components/SignalCatalog';
import { processSignals } from '../utils/processSignals';
import { calculateAllStats, calculateTimeBasedStats, calculateSymbolWinRates, calculateWeeklyStats } from '../utils/calculateStats';

export const DashboardView = ({
    models, activeTab, setActiveTab, appState,
    handleStateChange, handlePageChange, setSelectedSignal,
    highlightedSignalId, onSignalHover, setComparisonViewActive
}) => {
    const currentModelData = appState[activeTab];

    // ... (no changes to the memoized calculations)
    const dateFilteredSignals = useMemo(() => {
        const { startDate, endDate } = currentModelData.filters;
        if (!startDate && !endDate) {
            return currentModelData.allSignals;
        }
        return currentModelData.allSignals.filter(s => {
            if (!s.timestamp) return false;
            const signalDate = new Date(s.timestamp);
            if (isNaN(signalDate.getTime())) return false;
            const startMatch = !startDate || signalDate >= startDate;
            const endMatch = !endDate || signalDate <= endDate;
            return startMatch && endMatch;
        });
    }, [currentModelData.allSignals, currentModelData.filters.startDate, currentModelData.filters.endDate]);

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

    const displayedSignals = useMemo(() => {
        return processSignals(dateFilteredSignals, currentModelData.filters, currentModelData.sort);
    }, [dateFilteredSignals, currentModelData.filters, currentModelData.sort]);

    // ADDED: Create a unique key based on the filters. When this changes,
    // the component with this key will re-animate.
    const catalogKey = useMemo(() => 
        JSON.stringify({ ...currentModelData.filters, ...currentModelData.sort }),
        [currentModelData.filters, currentModelData.sort]
    );

    return (
        <div className="flex flex-col w-full">
            <TabNav
                models={models}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCompareClick={() => setComparisonViewActive(true)}
            />
            <ModelInfo modelId={activeTab} />
            <StatsGrid stats={statsForDisplay.overallStats} />
            <DetailsSectionDashboard
                modelId={activeTab}
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
            {/* UPDATED: Wrapped SignalCatalog to apply the key and animation class */}
            <div key={catalogKey} className="card-enter">
                <SignalCatalog
                    signals={displayedSignals}
                    currentPage={currentModelData.currentPage}
                    itemsPerPage={currentModelData.itemsPerPage}
                    onPageChange={handlePageChange}
                    onSignalClick={setSelectedSignal}
                    highlightedSignalId={highlightedSignalId}
                />
            </div>
        </div>
    );
};