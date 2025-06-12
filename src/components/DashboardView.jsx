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

export const DashboardView = ({
    models, activeTab, setActiveTab, appState,
    handleStateChange, handlePageChange, setSelectedSignal,
    highlightedSignalId, onSignalHover, setComparisonViewActive
}) => {
    const currentModelData = appState[activeTab];

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
            <SignalCatalog
                signals={displayedSignals}
                currentPage={currentModelData.currentPage}
                itemsPerPage={currentModelData.itemsPerPage}
                onPageChange={handlePageChange}
                onSignalClick={setSelectedSignal}
                highlightedSignalId={highlightedSignalId}
            />
        </div>
    );
};