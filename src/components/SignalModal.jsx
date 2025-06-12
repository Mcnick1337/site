// File: src/components/SignalModal.jsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LightweightChart } from './charts/LightweightChart';
import { Skeleton } from './Skeleton';

async function fetchOHLCData(symbol, signalTime, interval) {
    const hoursToFetch = 120;
    const startTime = new Date(signalTime.getTime() - (hoursToFetch * 60 * 60 * 1000)).getTime();
    const url = `/.netlify/functions/crypto-proxy?symbol=${symbol.toUpperCase()}&startTime=${startTime}&interval=${interval}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format from proxy.');
        return data.map(d => ({
            time: parseInt(d[0]), open: parseFloat(d[1]), close: parseFloat(d[2]),
            high: parseFloat(d[3]), low: parseFloat(d[4]),
        })).reverse();
    } catch (error) {
        console.error("Failed to fetch OHLC data:", error);
        return null;
    }
}

const availableIntervals = ['5m', '15m', '1h', '4h', '1d'];
const intervalMap = { '5m': '5min', '15m': '15min', '1h': '1hour', '4h': '4hour', '1d': '1day' };

export const SignalModal = ({ signal, onClose, cache, updateCache }) => {
    const [isShowing, setIsShowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ohlcData, setOhlcData] = useState(null);
    const [interval, setInterval] = useState('1h');
    const [crosshairData, setCrosshairData] = useState(null);

    useEffect(() => {
        requestAnimationFrame(() => setIsShowing(true));
        const loadData = async () => {
            setIsLoading(true);
            const kucoinInterval = intervalMap[interval];
            const cacheKey = `${signal.timestamp}-${kucoinInterval}`;
            let data = cache[cacheKey];
            if (!data) {
                data = await fetchOHLCData(signal.symbol, new Date(signal.timestamp), kucoinInterval);
                if (data) updateCache(cacheKey, data);
            }
            setOhlcData(data);
            setIsLoading(false);
        };
        loadData();
    }, [signal, cache, updateCache, interval]);

    const handleClose = () => {
        setIsShowing(false);
        setTimeout(onClose, 300);
    };

    const displayData = crosshairData || (ohlcData && ohlcData[ohlcData.length - 1]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out" onClick={handleClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <motion.div 
                className="relative z-10 bg-gray-100 dark:bg-dark-card w-full max-w-4xl rounded-2xl border border-black/10 dark:border-white/20 shadow-2xl p-6 m-4"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{signal.symbol} - Signal Details</h2>
                    <button onClick={handleClose} className="text-3xl text-gray-400 hover:text-white transition-colors">×</button>
                </div>

                {displayData && (
                    <div className="flex space-x-4 text-xs mb-2 text-gray-600 dark:text-gray-400">
                        <span>O: <span className="font-mono">{displayData.open.toFixed(2)}</span></span>
                        <span>H: <span className="font-mono">{displayData.high.toFixed(2)}</span></span>
                        <span>L: <span className="font-mono">{displayData.low.toFixed(2)}</span></span>
                        <span>C: <span className="font-mono">{displayData.close.toFixed(2)}</span></span>
                    </div>
                )}
                
                <div className="flex items-center space-x-2 mb-2">
                    {availableIntervals.map(iv => (
                        <button key={iv} onClick={() => setInterval(iv)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                interval === iv 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'
                            }`}
                        >
                            {iv.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="relative w-full h-[300px]">
                    {isLoading ? (
                        <Skeleton className="w-full h-full" />
                    ) : ohlcData ? (
                        <LightweightChart 
                            ohlcData={ohlcData} 
                            signal={signal} 
                            onCrosshairMove={setCrosshairData}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400">Failed to load chart data.</div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Entry Price</p>
                                <p className="text-lg font-semibold">{parseFloat(signal["Entry Price"]).toFixed(5)}</p>
                            </div>
                            {signal["Take Profit Targets"]?.[0] && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Take Profit 1</p>
                                    <p className="text-lg font-semibold text-green-500 dark:text-green-400">{parseFloat(signal["Take Profit Targets"][0]).toFixed(5)}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Stop Loss</p>
                                <p className="text-lg font-semibold text-red-500 dark:text-red-400">{parseFloat(signal["Stop Loss"]).toFixed(5)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Signal Time</p>
                                <p className="text-lg font-semibold">{new Date(signal.timestamp).toLocaleString()}</p>
                            </div>
                             {signal["Take Profit Targets"]?.[1] && (
                                <div className="md:col-start-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Take Profit 2</p>
                                    <p className="text-lg font-semibold text-green-500 dark:text-green-400">{parseFloat(signal["Take Profit Targets"][1]).toFixed(5)}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};