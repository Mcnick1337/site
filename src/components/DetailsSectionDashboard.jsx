// File: src/components/DetailsSectionDashboard.jsx

import { EquityChart } from './charts/EquityChart';
import { TimeChart } from './charts/TimeChart';
import { SymbolWinRates } from './charts/SymbolWinRates';
import { WeeklyPerformanceChart } from './WeeklyPerformanceChart';
// --- ADDED: Import the new chart component ---
import { PLDistributionChart } from './charts/PLDistributionChart';

export const DetailsSectionDashboard = ({ modelId, appState, onSignalHover }) => {
    const data = appState[modelId];

    return (
        <div className="my-8">
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Hypothetical Equity Curve</h3>
                <EquityChart 
                    equityCurveData={data.equityCurveData} 
                    onSignalHover={onSignalHover} 
                    timeUnit="hour"
                />
            </div>

            {/* --- UPDATED: The grid is now 2x3 to accommodate the new chart --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                     <SymbolWinRates rates={data.symbolWinRates} />
                </div>
                
                {/* --- ADDED: The new P/L Distribution Chart widget --- */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold mb-4">Trade P/L Distribution</h3>
                    <div className="flex-grow">
                        <PLDistributionChart returns={data.overallStats.returns} />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Performance by Day</h3>
                    <TimeChart 
                        chartData={data.dayOfWeekStats} 
                        labels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']} 
                    />
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Performance by Hour (UTC)</h3>
                    <TimeChart 
                        chartData={data.hourOfDayStats} 
                        labels={Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))} 
                    />
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <WeeklyPerformanceChart weeklyStats={data.weeklyStats} />
                </div>
            </div>
        </div>
    );
};