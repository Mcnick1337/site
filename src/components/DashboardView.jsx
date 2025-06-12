// File: src/components/DashboardView.jsx

import { useMemo } from 'react';
import { TabNav } from './TabNav';
// ... (other imports)
import { processSignals } from '../utils/processSignals';
// --- IMPORT ALL THE STATS FUNCTIONS ---
import { calculateAllStats, calculateTimeBasedStats, calculateSymbolWinRates, calculateWeeklyStats } from '../utils/calculateStats';

export const DashboardView = ({ /* ... (all props) ... */ }) => {
    const currentModelData = appState[activeTab];

    // --- STEP 1: Filter signals by date range first ---
    const dateFilteredSignals = useMemo(() => {
        const { startDate, endDate } = currentModelData.filters;
        if (!startDate && !endDate) {
            return currentModelData.allSignals;
        }
        return currentModelData.allSignals.filter(s => {
            const signalDate = new Date(s.timestamp);
            if (isNaN(signalDate.getTime())) return false;
            const startMatch = !startDate || signalDate >= startDate;
            const endMatch = !endDate || signalDate <= endDate;
            return startMatch && endMatch;
        });
    }, [currentModelData.allSignals, currentModelData.filters.startDate, currentModelData.filters.endDate]);

    // --- STEP 2: Recalculate all stats based on the date-filtered signals ---
    const statsForDisplay = useMemo(() => {
        const overallStats = calculateAllStats(dateFilteredSignals); // No 'filters' needed here
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

    // --- STEP 3: Apply the *other* filters (symbol, type, etc.) for the signal catalog view ---
    const displayedSignals = useMemo(() => {
        // Pass the already date-filtered signals to be processed further
        return processSignals(dateFilteredSignals, currentModelData.filters, currentModelData.sort);
    }, [dateFilteredSignals, currentModelData.filters, currentModelData.sort]);

    return (
        <>
            <TabNav /* ... */ />
            <ModelInfo modelId={activeTab} />
            
            {/* --- USE THE NEWLY CALCULATED STATS --- */}
            <StatsGrid stats={statsForDisplay.overallStats} />
            
            {/* We need to create a temporary appState-like object for DetailsSectionDashboard */}
            <DetailsSectionDashboard
                modelId={activeTab}
                appState={{ [activeTab]: statsForDisplay }}
                onSignalHover={onSignalHover}
            />
            
            <FilterControls /* ... */ />
            
            {/* This remains the same, as it uses the final filtered list */}
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