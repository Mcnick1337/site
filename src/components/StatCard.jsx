// File: src/components/StatCard.jsx

import React from 'react';
import { Tooltip } from './Tooltip';
import { InformationCircleIcon } from '@heroicons/react/20/solid';

export const StatCard = ({ label, value, colorClass, tooltip }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20">
        <div className={`text-4xl font-bold mb-2 ${colorClass}`}>{value}</div>
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400 uppercase tracking-wider">
            <span>{label}</span>
            {tooltip && (
                <Tooltip text={tooltip}>
                    <InformationCircleIcon className="h-4 w-4 cursor-pointer text-gray-500" />
                </Tooltip>
            )}
        </div>
    </div>
);