// File: src/components/DashboardView.jsx

import { useMemo } from 'react';
import { TabNav } from './TabNav';
import { ModelInfo } from './ModelInfo';
import { StatsGrid } from './StatsGrid';
import { DetailsSectionDashboard } from './DetailsSectionDashboard';
import { FilterControls } from './FilterControls';
import { SignalCatalog } from './SignalCatalog';
import { processSignals } from '../utils/processSignals';
// REMOVED: No longer importing WeeklyPerformanceChart here

export const DashboardView = ({
    models, activeTab, setActiveTab, appState,
    handleStateChange, handlePageChange, setSelectedSignal,
    highlightedSignalId, onSignalHover, setComparisonViewActive
}) => {
    const currentModelData = appState[activeTab];

    const displayedSignals = useMemo(() => {
        return processSignals(currentModelData.allSignals, currentModelData.filters, currentModelData.sort);
    }, [currentModelData.allSignals, currentModelData.filters, currentModelData.sort]);

    return (
        <>
            <TabNav
                models={models}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCompareClick={() => setComparisonViewActive(true)}
            />
            <ModelInfo modelId={activeTab} />
            
            {/* This is the original layout, restored */}
            <StatsGrid stats={currentModelData.overallStats} />
            
            <DetailsSectionDashboard
                modelId={activeTab}
                appState={appState}
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