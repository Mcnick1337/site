// File: src/components/v2/SignalModalV2_Advanced.jsx

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LightweightChart } from '../charts/LightweightChart';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { verifySignalOutcome } from '../../utils/calculateStats';

async function fetchOHLCDataV2(symbol, signalTime, interval) {
    const hoursToFetch = 120;
    const startTime = new Date(new Date(signalTime).getTime() - (hoursToFetch * 60 * 60 * 1000)).getTime();
    const url = `/.netlify/functions/crypto-proxy?symbol=${symbol.toUpperCase()}&startTime=${startTime}&interval=${interval}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.statusText}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format from proxy.');
        return data.map(d => ({
            time: parseInt(d[0]), open: parseFloat(d[1]), close: parseFloat(d[2]),
            high: parseFloat(d[3]), low: parseFloat(d[4]), volume: parseFloat(d[5])
        })).reverse();
    } catch (error) {
        console.error("Failed to fetch OHLC data for V2 Advanced modal:", error);
        return null;
    }
}

const availableIntervals = ['5m', '15m', '1h', '4h', '1d'];
const intervalMap = { '5m': '5min', '15m': '15min', '1h': '1hour', '4h': '4hour', '1d': '1day' };

const DetailItem = ({ label, value, valueClass = '' }) => (
    <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-base font-semibold ${valueClass}`}>{value}</p>
    </div>
);

export const SignalModalV2_Advanced = ({ signal, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [ohlcData, setOhlcData] = useState(null);
    const [interval, setInterval] = useState('1h');
    const [crosshairData, setCrosshairData] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState({ status: 'unverified', message: '' });
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const loadData = async () => {
            const kucoinInterval = intervalMap[interval];
            const data = await fetchOHLCDataV2(signal.symbol, signal.timestamp_utc, kucoinInterval);
            setOhlcData(data);
            setIsLoading(false);
        };
        const timer = setTimeout(loadData, 50);
        return () => clearTimeout(timer);
    }, [signal, interval]);

    const handleVerifySignal = async () => {
        setIsVerifying(true);
        const result = await verifySignalOutcome(signal);
        setVerificationStatus(result);
        setIsVerifying(false);
    };

    const handleClose = () => setTimeout(onClose, 300);
    const displayData = crosshairData || (ohlcData && ohlcData.slice(-1)[0]);
    
    const chartSignalProp = useMemo(() => ({
        symbol: signal.symbol,
        timestamp: signal.timestamp_utc,
        "Entry Price": signal.trade_parameters.entry_price,
        "Take Profit Targets": [signal.trade_parameters.take_profit],
        "Stop Loss": signal.trade_parameters.stop_loss,
    }), [signal]);

    // --- THE FIX IS HERE: Defensively check for arrays ---
    const confluenceFactors = Array.isArray(signal.ai_confluence) ? signal.ai_confluence : [];
    const counterFactors = Array.isArray(signal.ai_counters) ? signal.ai_counters : [];

    const statusStyles = {
        WIN: 'bg-green-500/20 text-green-300',
        LOSS: 'bg-red-500/20 text-red-300',
        EXPIRED: 'bg-amber-500/20 text-amber-300',
        UNVERIFIED: 'bg-gray-500/20 text-gray-300',
        ERROR: 'bg-red-800/50 text-red-300',
        UNKNOWN: 'bg-gray-500/20 text-gray-300',
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <motion.div 
                className="relative z-10 bg-dark-card w-full max-w-6xl rounded-2xl border border-white/10 shadow-2xl p-6 m-4 flex flex-col"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{signal.symbol} - AI Pro Advanced Details</h2>
                    <button onClick={handleClose} className="text-3xl text-gray-400 hover:text-white transition-colors">×</button>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
                    <div className="lg:w-2/3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                {availableIntervals.map(iv => (
                                    <button key={iv} onClick={() => setInterval(iv)} className={`px-3 py-1 text-sm rounded-md transition-colors ${interval === iv ? 'bg-blue-500 text-white' : 'bg-dark-card/60 text-gray-300 hover:bg-white/10'}`}>{iv.toUpperCase()}</button>
                                ))}
                            </div>
                            <div className="flex space-x-4 text-xs text-gray-400 h-4">
                                {displayData && !isLoading && (
                                    <span>O: <span className="font-mono">{displayData.open.toFixed(2)}</span><span className="ml-2">H: <span className="font-mono">{displayData.high.toFixed(2)}</span></span><span className="ml-2">L: <span className="font-mono">{displayData.low.toFixed(2)}</span></span><span className="ml-2">C: <span className="font-mono">{displayData.close.toFixed(2)}</span></span></span>
                                )}
                            </div>
                        </div>
                        <div className="relative w-full h-[400px] lg:h-auto flex-grow bg-black/20 rounded-lg">
                            <LightweightChart ohlcData={ohlcData} signal={chartSignalProp} onCrosshairMove={setCrosshairData} />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-dark-card/50 backdrop-blur-sm transition-opacity duration-300 rounded-lg">
                                    <p className="text-gray-300 animate-pulse text-lg">Loading Chart Data...</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:w-1/3 flex-shrink-0 flex flex-col gap-4 lg:h-[440px] lg:overflow-y-auto custom-scrollbar pr-2">
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Signal Verification</h3>
                            <div className="flex gap-4">
                                <button onClick={handleVerifySignal} disabled={isVerifying} className="flex-grow bg-cyan-600 text-white font-semibold rounded-lg px-4 py-2 h-10 transition-colors hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {isVerifying ? 'Verifying...' : 'Verify Signal'}
                                </button>
                                <div className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center ${statusStyles[verificationStatus.status.toUpperCase()]}`}>
                                    {verificationStatus.status.toUpperCase()}
                                </div>
                            </div>
                            {verificationStatus.message && <p className="text-xs text-gray-400 mt-2">{verificationStatus.message}</p>}
                        </div>
                        <div className="bg-black/20 p-4 rounded-lg grid grid-cols-2 gap-4">
                            <DetailItem label="Leverage" value={`${signal.trade_parameters.leverage}x`} />
                            <DetailItem label="Confidence" value={`${(signal.confidence * 100).toFixed(0)}%`} valueClass="text-cyan-400" />
                            <DetailItem label="Sentiment" value={(signal.market_snapshot.sentiment_score * 100).toFixed(0)} />
                            <DetailItem label="RSI 14" value={signal.market_snapshot.rsi_14.toFixed(2)} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">AI Reasoning</h3>
                            <p className="text-sm text-gray-400">{signal.ai_reasoning}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2"><CheckIcon className="h-5 w-5" />Confluence</h4>
                                <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2 text-sm">
                                    {confluenceFactors.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2"><XMarkIcon className="h-5 w-5" />Counters</h4>
                                <ul className="list-disc list-inside text-gray-300 space-y-1 pl-2 text-sm">
                                    {counterFactors.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};