// File: src/components/v2/DetailsSectionV2_Advanced.jsx

import React from 'react';
import { EquityChart } from '../charts/EquityChart';
import { SymbolWinRates } from '../charts/SymbolWinRates';
import { PLDistributionChart } from '../charts/PLDistributionChart';

export const DetailsSectionV2_Advanced = ({ stats }) => {
    return (
        <div className="my-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Hypothetical Equity Curve</h3>
                <EquityChart 
                    equityCurveData={stats.equityCurveData} 
                    timeUnit="day"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SymbolWinRates rates={stats.symbolWinRates} />
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold mb-4">Trade P/L Distribution</h3>
                    <div className="flex-grow">
                        <PLDistributionChart returns={stats.returns} />
                    </div>
                </div>
            </div>
        </div>
    );
};