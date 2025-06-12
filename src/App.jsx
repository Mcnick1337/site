// File: src/App.jsx

import { useState, useEffect, createContext } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PortfolioView } from './components/PortfolioView';
import { ComparisonView } from './components/ComparisonView';
import { SignalModal } from './components/SignalModal';
import { calculateAllStats, calculateTimeBasedStats, calculateSymbolWinRates, calculateWeeklyStats } from './utils/calculateStats';
import 'chartjs-adapter-date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler);

export const ThemeContext = createContext(null);

const AI_MODELS = {
    'ai-max': { name: 'AI Max', file: '/signals_claude_log.json', experimental: false },
    'ai-bob': { name: 'AI Bob', file: '/signals_gemini_log.json', experimental: false },
    'ai-bob-2': { name: 'AI Bob-2', file: '/signals_bob_2_log.json', experimental: true },
    'ai-bob-3': { name: 'AI Bob-3', file: '/signals_bob_3_log.json', experimental: true },
};

const floatingElements = [
    { emoji: '📈', left: '10%', duration: '25s', delay: '0s', size: 'text-5xl' },
    { emoji: '💹', left: '20%', duration: '30s', delay: '-5s', size: 'text-4xl' },
    { emoji: '📊', left: '35%', duration: '22s', delay: '-10s', size: 'text-5xl' },
    { emoji: '💰', left: '50%', duration: '28s', delay: '-2s', size: 'text-3xl' },
    { emoji: '🚀', left: '70%', duration: '20s', delay: '-8s', size: 'text-4xl' },
    { emoji: '📉', left: '85%', duration: '35s', delay: '-15s', size: 'text-5xl' },
];

const createDefaultAiState = () => ({
    allSignals: [], symbolWinRates: [], overallStats: {},
    dayOfWeekStats: {}, hourOfDayStats: {}, weeklyStats: [],
    currentPage: 1, itemsPerPage: 12,
    filters: { symbol: '', signalType: '', status: '', minConfidence: '50', startDate: null, endDate: null },
    sort: { by: 'timestamp' }, ohlcCache: {}, equityCurveData: [],
});

export default function App() {
    const [appState, setAppState] = useState(() => {
        const initialState = {};
        Object.keys(AI_MODELS).forEach(id => initialState[id] = createDefaultAiState());
        return initialState;
    });

    const [activeView, setActiveView] = useState('dashboard');
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('lastActiveTab') || 'ai-max');
    const [comparisonViewActive, setComparisonViewActive] = useState(false);
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [highlightedSignalId, setHighlightedSignalId] = useState(null);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
            return window.localStorage.getItem('theme');
        }
        return 'dark';
    });

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('lastActiveTab', activeTab);
        const currentModel = appState[activeTab];
        if (currentModel.allSignals.length === 0) {
            fetch(AI_MODELS[activeTab].file)
                .then(res => res.ok ? res.json() : Promise.reject(new Error(`File not found`)))
                .then(signals => {
                    setAppState(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], allSignals: signals } }));
                }).catch(err => console.error(err));
        }
    }, [activeTab]);
    
    const handleStateChange = (type, key, value) => {
        setAppState(prev => ({
            ...prev, [activeTab]: { ...prev[activeTab], [type]: { ...prev[activeTab][type], [key]: value }, currentPage: type === 'filters' ? 1 : prev[activeTab].currentPage }
        }));
    };

    const handlePageChange = (newPage) => {
        setAppState(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], currentPage: newPage } }));
    };
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className="bg-gray-100 dark:bg-dark-bg min-h-screen text-gray-800 dark:text-gray-200 font-sans relative transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    {floatingElements.map((item, index) => (
                        <span key={index} className={`float-anim ${item.size}`} style={{ left: item.left, animationDuration: item.duration, animationDelay: item.delay }}>
                            {item.emoji}
                        </span>
                    ))}
                </div>
                <div className="relative z-10">
                    <Layout activeView={activeView} setActiveView={setActiveView}>
                        <div className="p-4 md:p-8 flex flex-col flex-grow">
                            <Header />
                            {activeView === 'dashboard' && (
                                <DashboardView
                                    models={AI_MODELS} activeTab={activeTab} setActiveTab={setActiveTab}
                                    appState={appState} handleStateChange={handleStateChange}
                                    handlePageChange={handlePageChange} setSelectedSignal={setSelectedSignal}
                                    highlightedSignalId={highlightedSignalId} onSignalHover={setHighlightedSignalId}
                                    setComparisonViewActive={setComparisonViewActive}
                                />
                            )}
                            {activeView === 'portfolio' && <PortfolioView appState={appState} models={AI_MODELS} activeTab={activeTab} />}
                        </div>
                    </Layout>
                </div>
                {selectedSignal && (
                    <SignalModal
                        signal={selectedSignal} onClose={() => setSelectedSignal(null)}
                        cache={appState[activeTab].ohlcCache}
                        updateCache={(key, data) => setAppState(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], ohlcCache: { ...prev[activeTab].ohlcCache, [key]: data } } }))}
                    />
                )}
            </div>
        </ThemeContext.Provider>
    );
}