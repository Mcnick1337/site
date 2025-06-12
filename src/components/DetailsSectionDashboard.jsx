// File: src/components/DetailsSectionDashboard.jsx

import { EquityChart } from './charts/EquityChart';
import { TimeChart } from './charts/TimeChart';
import { SymbolWinRates } from './charts/SymbolWinRates';
import { WeeklyPerformanceChart } from './WeeklyPerformanceChart'; // 1. Import the new chart

export const DetailsSectionDashboard = ({ modelId, appState, onSignalHover }) => {
    const data = appState[modelId];

    return (
        // This is now the main container, not a grid itself.
        <div className="my-8">
            {/* Main Equity Curve Chart - remains full width */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Hypothetical Equity Curve</h3>
                <EquityChart 
                    equityCurveData={data.equityCurveData} 
                    onSignalHover={onSignalHover} 
                    timeUnit="hour"
                />
            </div>

            {/* --- NEW 2x2 Grid for the four detail widgets --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Widget 1: Symbol Win Rates (Consistent wrapper added) */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                     <SymbolWinRates rates={data.symbolWinRates} />
                </div>

                {/* Widget 2: Performance by Day */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Performance by Day</h3>
                    <TimeChart 
                        chartData={data.dayOfWeekStats} 
                        labels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']} 
                    />
                </div>

                {/* Widget 3: Performance by Hour */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Performance by Hour (UTC)</h3>
                    <TimeChart 
                        chartData={data.hourOfDayStats} 
                        labels={Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))} 
                    />
                </div>

                {/* Widget 4: The New Weekly Performance Chart */}
                {/* Note: The WeeklyPerformanceChart component already has its own styled wrapper, so we don't need one here. */}
                <WeeklyPerformanceChart weeklyStats={data.weeklyStats} />
            </div>
        </div>
    );
};