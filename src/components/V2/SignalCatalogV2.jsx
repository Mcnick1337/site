// File: src/components/v2/SignalCatalogV2.jsx

import React from 'react';
import { SignalCardV2 } from './SignalCardV2';

export const SignalCatalogV2 = ({ signals, metrics, onSignalClick }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {signals.map((signal) => (
                <div key={signal.timestamp} className="card-enter">
                    <SignalCardV2 
                        signal={signal} 
                        metrics={metrics}
                        onClick={() => onSignalClick(signal)} 
                    />
                </div>
            ))}
        </div>
    );
};