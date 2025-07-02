// File: src/components/EmptyState.jsx

import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const EmptyState = ({ title, message }) => {
    return (
        <div className="text-center bg-white/5 rounded-lg p-12 my-8">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{message}</p>
        </div>
    );
};