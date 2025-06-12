// File: src/components/SignalModal.jsx

import { useEffect, useState } from 'react';
import { LightweightChart } from './charts/LightweightChart';

async function fetchOHLCData(symbol, signalTime) {
    const startTime = new Date(signalTime.getTime() - 8 * 60 * 60 * 1000).getTime();
    const url = `/.netlify/functions/crypto-proxy?symbol=${symbol.toUpperCase()}&startTime=${startTime}`;
    try {
        const response = await fetch(url);
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

export const SignalModal = ({ signal, onClose, cache, updateCache }) => {
    const [isShowing, setIsShowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ohlcData, setOhlcData] = useState(null);

    useEffect(() => {
        requestAnimationFrame(() => setIsShowing(true));

        const loadData = async () => {
            setIsLoading(true);
            let data = cache[signal.timestamp];
            if (!data) {
                data = await fetchOHLCData(signal.symbol, new Date(signal.timestamp));
                if (data) updateCache(signal.timestamp, data);
            }
            setOhlcData(data);
            setIsLoading(false);
        };
        loadData();
    }, [signal, cache, updateCache]);

    const handleClose = () => {
        setIsShowing(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isShowing ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
            {/* This is the backdrop. It blurs what's behind it. */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            
            {/* This is the modal content. Adding "relative z-10" lifts it above the backdrop. */}
            <div 
                className={`relative z-10 bg-dark-card w-full max-w-4xl rounded-2xl border border-white/20 shadow-2xl p-6 m-4 transition-all duration-300 ease-in-out ${isShowing ? 'opacity-100 transform-none' : 'opacity-0 transform -translate-y-4 scale-95'}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{signal.symbol} - Signal Details</h2>
                    <button onClick={handleClose} className="text-3xl text-gray-400 hover:text-white transition-colors">×</button>
                </div>
                <div className="relative w-full h-[300px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">Loading Chart...</div>
                    ) : ohlcData ? (
                        <LightweightChart ohlcData={ohlcData} signal={signal} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400">Failed to load chart data.</div>
                    )}
                </div>
            </div>
        </div>
    );
};