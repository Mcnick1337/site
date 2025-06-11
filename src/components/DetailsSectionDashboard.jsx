import { EquityChart } from './charts/EquityChart';
import { TimeChart } from './charts/TimeChart';
import { SymbolWinRates } from './charts/SymbolWinRates';

export const DetailsSectionDashboard = ({ modelId, appState, onSignalHover }) => {
    const data = appState[modelId];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Hypothetical Equity Curve</h3>
                <EquityChart 
                    equityCurveData={data.equityCurveData} 
                    onSignalHover={onSignalHover} 
                    timeUnit="hour"
                />
            </div>
            <SymbolWinRates rates={data.symbolWinRates} />
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Performance by Day of Week</h3>
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
        </div>
    );
};