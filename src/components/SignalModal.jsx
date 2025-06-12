// File: src/components/SignalModal.jsx

import { useEffect, useState } from 'react';
import { LightweightChart } from './charts/LightweightChart';

// --- CHANGE 1: The fetch function now accepts an 'interval' ---
async function fetchOHLCData(symbol, signalTime, interval) {
    const hoursToFetch = 120;
    const startTime = new Date(signalTime.getTime() - (hoursToFetch * 60 * 60 * 1000)).getTime();
    
    // --- CHANGE 2: Pass the interval as a query parameter ---
    const url = `/.netlify/functions/crypto-proxy?symbol=${symbol.toUpperCase()}&startTime=${startTime}&interval=${interval}`;
    try {
        const response = await fetch(url);
        // ... (rest of the function is the same)
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format from proxy.');
        return data.map(d => ({
            time: parseInt(d[0]),
            open: parseFloat(d[1]), close: parseFloat(d[2]),
            high: parseFloat(d[3]), low: parseFloat(d[4]),
        })).reverse();
    } catch (error) {
        console.error("Failed to fetch OHLC data:", error);
        return null;
    }
}

// --- List of available intervals for the UI ---
const availableIntervals = ['5m', '15m', '1h', '4h', '1d'];
// KuCoin uses specific values for these intervals
const intervalMap = { '5m': '5min', '15m': '15min', '1h': '1hour', '4h': '4hour', '1d': '1day' };


export const SignalModal = ({ signal, onClose, cache, updateCache }) => {
    const [isShowing, setIsShowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ohlcData, setOhlcData] = useState(null);
    // --- CHANGE 3: State for the selected chart interval ---
    const [interval, setInterval] = useState('1h'); 

    useEffect(() => {
        requestAnimationFrame(() => setIsShowing(true));
        const loadData = async () => {
            setIsLoading(true);
            
            // --- CHANGE 4: Improved caching logic ---
            // Create a unique key for each signal AND interval to prevent conflicts
            const kucoinInterval = intervalMap[interval];
            const cacheKey = `${signal.timestamp}-${kucoinInterval}`;
            
            let data = cache[cacheKey];
            if (!data) {
                data = await fetchOHLCData(signal.symbol, new Date(signal.timestamp), kucoinInterval);
                if (data) {
                    // Use the new composite key when updating the cache
                    updateCache(cacheKey, data);
                }
            }
            setOhlcData(data);
            setIsLoading(false);
        };
        loadData();
    // --- CHANGE 5: Re-run this effect when the interval changes ---
    }, [signal, cache, updateCache, interval]);

    const handleClose = () => {
        setIsShowing(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isShowing ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className={`relative z-10 bg-dark-card w-full max-w-4xl rounded-2xl border border-white/20 shadow-2xl p-6 m-4 transition-all duration-300 ease-in-out ${isShowing ? 'opacity-100 transform-none' : 'opacity-0 transform -translate-y-4 scale-95'}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{signal.symbol} - Signal Details</h2>
                    <button onClick={handleClose} className="text-3xl text-gray-400 hover:text-white transition-colors">×</button>
                </div>

                {/* --- CHANGE 6: Interval Selection UI --- */}
                <div className="flex items-center space-x-2 mb-2">
                    {availableIntervals.map(iv => (
                        <button
                            key={iv}
                            onClick={() => setInterval(iv)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                interval === iv 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                        >
                            {iv.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="relative w-full h-[300px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">Loading {interval.toUpperCase()} Chart...</div>
                    ) : ohlcData ? (
                        <LightweightChart ohlcData={ohlcData} signal={signal} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400">Failed to load chart data.</div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    {/* ... (your details section remains unchanged) ... */}
                </div>
            </div>
        </div>
    );
};