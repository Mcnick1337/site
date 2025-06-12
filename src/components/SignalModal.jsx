// File: src/components/SignalModal.jsx (Reverted to no indicators)

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LightweightChart } from './charts/LightweightChart';

// Reverted: Removed fetchIndicatorData
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
    const [isLoading, setIsLoading] = useState(true);
    const [ohlcData, setOhlcData] = useState(null);
    // Reverted: Removed indicatorData state
    const [interval, setInterval] = useState('1h');
    const [crosshairData, setCrosshairData] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        const loadData = async () => {
            const kucoinInterval = intervalMap[interval];
            const ohlcCacheKey = `ohlc-${signal.timestamp}-${kucoinInterval}`;
            let ohlc = cache[ohlcCacheKey];
            if (!ohlc) {
                ohlc = await fetchOHLCData(signal.symbol, new Date(signal.timestamp), kucoinInterval);
                if (ohlc) { updateCache(ohlcCacheKey, ohlc); }
            }
            setOhlcData(ohlc);
            setIsLoading(false);
        };
        const timer = setTimeout(loadData, 50);
        return () => clearTimeout(timer);
    }, [signal, interval, cache, updateCache]);

    const handleClose = () => setTimeout(onClose, 300);
    const displayData = crosshairData || (ohlcData && ohlcData.slice(-1)[0]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <motion.div 
                className="relative z-10 bg-gray-100 dark:bg-dark-card w-full max-w-6xl rounded-2xl border border-black/10 dark:border-white/20 shadow-2xl p-6 m-4 flex flex-col"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{signal.symbol} - Signal Details</h2>
                    <button onClick={handleClose} className="text-3xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">×</button>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
                    <div className="lg:w-2/3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                {availableIntervals.map(iv => (
                                    <button key={iv} onClick={() => setInterval(iv)} className={`px-3 py-1 text-sm rounded-md transition-colors ${interval === iv ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'}`}>{iv.toUpperCase()}</button>
                                ))}
                            </div>
                            <div className="flex space-x-4 text-xs text-gray-600 dark:text-gray-400 h-4">
                                <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                    {displayData && (<>
                                        <span>O: <span className="font-mono">{displayData.open.toFixed(2)}</span></span>
                                        <span className="ml-4">H: <span className="font-mono">{displayData.high.toFixed(2)}</span></span>
                                        <span className="ml-4">L: <span className="font-mono">{displayData.low.toFixed(2)}</span></span>
                                        <span className="ml-4">C: <span className="font-mono">{displayData.close.toFixed(2)}</span></span>
                                    </>)}
                                </div>
                            </div>
                        </div>
                        {/* Reverted: Chart container height is now smaller */}
                        <div className="relative w-full h-[400px] bg-gray-200 dark:bg-black/20 rounded-lg">
                            <div className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <LightweightChart ohlcData={ohlcData} signal={signal} onCrosshairMove={setCrosshairData} />
                            </div>
                            <div className={`absolute inset-0 flex items-center justify-center bg-dark-card/30 backdrop-blur-sm transition-opacity duration-300 rounded-lg ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                <p className="text-gray-300 animate-pulse text-lg">Loading Chart...</p>
                            </div>
                        </div>
                    </div>
                    {/* Reverted: Details container height is now smaller */}
                    <div className="relative lg:w-1/3 flex-shrink-0 lg:h-[440px]">
                        <div className={`flex flex-col gap-4 lg:overflow-y-auto custom-scrollbar h-full pr-2 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div><p className="text-sm text-gray-500 dark:text-gray-400">Entry Price</p><p className="text-lg font-semibold">{parseFloat(signal["Entry Price"]).toFixed(5)}</p></div>
                                {signal["Take Profit Targets"]?.[0] && <div><p className="text-sm text-gray-500 dark:text-gray-400">Take Profit 1</p><p className="text-lg font-semibold text-green-600 dark:text-green-400">{parseFloat(signal["Take Profit Targets"][0]).toFixed(5)}</p></div>}
                                <div><p className="text-sm text-gray-500 dark:text-gray-400">Stop Loss</p><p className="text-lg font-semibold text-red-600 dark:text-red-400">{parseFloat(signal["Stop Loss"]).toFixed(5)}</p></div>
                                <div><p className="text-sm text-gray-500 dark:text-gray-400">Signal Time</p><p className="text-sm font-semibold">{new Date(signal.timestamp).toLocaleString()}</p></div>
                                {signal["Take Profit Targets"]?.[1] && <div className="col-span-2 md:col-span-1"><p className="text-sm text-gray-500 dark:text-gray-400">Take Profit 2</p><p className="text-lg font-semibold text-green-600 dark:text-green-400">{parseFloat(signal["Take Profit Targets"][1]).toFixed(5)}</p></div>}
                            </div>
                            <div><h3 className="text-lg font-semibold mb-2">AI Reasoning</h3><p className="text-sm text-gray-600 dark:text-gray-400">{signal.Reasoning || 'No reasoning provided.'}</p></div>
                            <div><h3 className="text-lg font-semibold mb-2">Relevant News</h3><ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">{Array.isArray(signal["Relevant News Headlines"]) && signal["Relevant News Headlines"].length > 0 ? (signal["Relevant News Headlines"].map((headline, index) => <li key={index}>{headline}</li>)) : (<li>No relevant news provided.</li>)}</ul></div>
                        </div>
                        <div className={`absolute inset-0 bg-dark-card/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                             <p className="text-gray-300 animate-pulse text-lg">Loading Details...</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};