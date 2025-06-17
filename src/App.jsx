// File: src/App.jsx

import { useState, useEffect, createContext, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PortfolioView } from './components/PortfolioView';
import { ComparisonView } from './components/ComparisonView';
import { SignalModal } from './components/SignalModal';
import { BackToTopButton } from './components/BackToTopButton';
import { DashboardV2 } from './pages/DashboardV2';
// --- THE FIX IS HERE: Corrected the import path ---
import { SignalModalV2 } from './components/v2/SignalModalV2'; 
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler);

export const ThemeContext = createContext(null);

const AI_MODELS = {
    'ai-max': { name: 'AI Max', file: '/signals_claude_log.json', experimental: false },
    'ai-bob': { name: 'AI Bob', file: '/signals_gemini_log.json', experimental: false },
    'ai-bob-2': { name: 'AI Bob-2', file: '/signals_bob_2_log.json', experimental: true },
    'ai-bob-3': { name: 'AI Bob-3', file: '/signals_bob_3_log.json', experimental: true },
    'ai-bob-wol': { name: 'AI Bob WoL', file: '/signals_bob_WoL_log.json', experimental: true },
    'ai-pro-x2': { name: 'AI PRO X2', file: '/signals_PROX2_log.json', experimental: true },
};

const AI_PRO_MODEL = {
    id: 'ai-pro',
    signalsFile: '/signals_pro_log.json',
    metricsFile: '/signal_metrics.json',
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
    allSignals: [], 
    isLoading: false,
    symbolWinRates: [],
    overallStats: {},
    dayOfWeekStats: {},
    hourOfDayStats: {},
    weeklyStats: [],
    currentPage: 1,
    itemsPerPage: 12,
    filters: { 
        symbol: '',
        signalType: '',
        status: '',
        previousSignalStatus: '',
        minConfidence: '50',
        startDate: null,
        endDate: null,
        reasoningSearch: '',
    },
    sort: { by: 'timestamp' },
    ohlcCache: {},
    equityCurveData: [],
});

const createDefaultProState = () => ({
    signals: [],
    metrics: {},
    isLoading: false,
    filters: {
        symbol: '',
        direction: '',
        minConfidence: 0.5,
    },
    currentPage: 1,
    itemsPerPage: 9,
});

export default function App() {
    const [appState, setAppState] = useState(() => {
        const initialState = { proModel: createDefaultProState() };
        Object.keys(AI_MODELS).forEach(id => initialState[id] = createDefaultAiState());
        return initialState;
    });

    const [activeView, setActiveView] = useState('dashboard');
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('lastActiveTab') || 'ai-max');
    const [comparisonViewActive, setComparisonViewActive] = useState(false);
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [selectedSignalV2, setSelectedSignalV2] = useState(null);
    const [highlightedSignalId, setHighlightedSignalId] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const loadModelData = useCallback((modelId) => {
        if (!modelId || !AI_MODELS[modelId]) return;
        setAppState(prev => {
            if (prev[modelId].allSignals.length === 0 && !prev[modelId].isLoading) {
                fetch(AI_MODELS[modelId].file)
                    .then(res => res.ok ? res.json() : Promise.reject(new Error(`File not found`)))
                    .then(signals => {
                        const sortedSignals = [...signals].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                        const processedSignals = sortedSignals.map((signal, index) => {
                            if (index === 0) return { ...signal, previousStatus: null };
                            const prevSignal = sortedSignals[index - 1];
                            return { ...signal, previousStatus: prevSignal.performance?.status || null };
                        });
                        setAppState(current => ({
                            ...current,
                            [modelId]: { ...current[modelId], allSignals: processedSignals, isLoading: false }
                        }));
                    }).catch(err => {
                        console.error(`Failed to load model ${modelId}:`, err);
                        setAppState(current => ({
                            ...current,
                            [modelId]: { ...current[modelId], isLoading: false }
                        }));
                    });
                return { ...prev, [modelId]: { ...prev[modelId], isLoading: true } };
            }
            return prev;
        });
    }, []);

    const loadProModelData = useCallback(() => {
        setAppState(prev => {
            if (prev.proModel.signals.length === 0 && !prev.proModel.isLoading) {
                Promise.all([
                    fetch(AI_PRO_MODEL.signalsFile).then(res => res.ok ? res.json() : Promise.reject('Failed to load signals')),
                    fetch(AI_PRO_MODEL.metricsFile).then(res => res.ok ? res.json() : Promise.reject('Failed to load metrics'))
                ]).then(([signals, metrics]) => {
                    const sortedSignals = [...signals].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setAppState(current => ({
                        ...current,
                        proModel: { ...current.proModel, signals: sortedSignals, metrics, isLoading: false }
                    }));
                }).catch(err => {
                    console.error('Failed to load AI PRO model data:', err);
                    setAppState(current => ({
                        ...current,
                        proModel: { ...current.proModel, isLoading: false }
                    }));
                });
                return { ...prev, proModel: { ...prev.proModel, isLoading: true } };
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        if (activeView === 'dashboardV2') {
            loadProModelData();
        } else {
            localStorage.setItem('lastActiveTab', activeTab);
            loadModelData(activeTab);
        }
    }, [activeView, activeTab, loadModelData, loadProModelData]);

    const handleStateChange = useCallback((type, key, value) => {
        setAppState(prev => ({ 
            ...prev, 
            [activeTab]: { 
                ...prev[activeTab], 
                [type]: { ...prev[activeTab][type], [key]: value }, 
                currentPage: type === 'filters' ? 1 : prev[activeTab].currentPage 
            }
        }));
    }, [activeTab]);

    const handlePageChange = useCallback((newPage) => {
        setAppState(prev => ({ 
            ...prev, 
            [activeTab]: { ...prev[activeTab], currentPage: newPage } 
        }));
    }, [activeTab]);

    const updateCache = useCallback((key, data) => {
        setAppState(prev => ({ 
            ...prev, 
            [activeTab]: { 
                ...prev[activeTab], 
                ohlcCache: { ...prev[activeTab].ohlcCache, [key]: data } 
            }
        }));
    }, [activeTab]);

    const handleProFilterChange = useCallback((key, value) => {
        setAppState(prev => ({
            ...prev,
            proModel: {
                ...prev.proModel,
                currentPage: 1,
                filters: {
                    ...prev.proModel.filters,
                    [key]: value
                }
            }
        }));
    }, []);

    const handleProPageChange = useCallback((newPage) => {
        setAppState(prev => ({
            ...prev,
            proModel: {
                ...prev.proModel,
                currentPage: newPage,
            }
        }));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className="bg-gray-100 dark:bg-dark-bg min-h-screen text-gray-800 dark:text-gray-200 font-sans relative transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    {floatingElements.map((item, index) => (
                        <span 
                            key={index} 
                            className={`float-anim ${item.size}`} 
                            style={{ left: item.left, animationDuration: item.duration, animationDelay: item.delay }}
                        >
                            {item.emoji}
                        </span>
                    ))}
                </div>
                <div className="relative z-10">
                    <Layout activeView={activeView} setActiveView={setActiveView}>
                        <div className="p-4 md:p-8">
                            <Header />
                            {activeView === 'dashboard' && !comparisonViewActive && (
                                <DashboardView
                                    models={AI_MODELS}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    appState={appState}
                                    handleStateChange={handleStateChange}
                                    handlePageChange={handlePageChange}
                                    setSelectedSignal={setSelectedSignal}
                                    highlightedSignalId={highlightedSignalId}
                                    onSignalHover={setHighlightedSignalId}
                                    setComparisonViewActive={setComparisonViewActive}
                                />
                            )}
                            {activeView === 'dashboard' && comparisonViewActive && (
                                <ComparisonView 
                                    appState={appState}
                                    models={AI_MODELS}
                                    onExit={() => setComparisonViewActive(false)}
                                    loadModelData={loadModelData}
                                />
                            )}
                            {activeView === 'portfolio' && (
                                <PortfolioView 
                                    appState={appState}
                                    models={AI_MODELS}
                                    activeTab={activeTab}
                                    loadModelData={loadModelData}
                                />
                            )}
                            {activeView === 'dashboardV2' && (
                                <DashboardV2
                                    proModelState={appState.proModel}
                                    setSelectedSignal={setSelectedSignalV2}
                                    onFilterChange={handleProFilterChange}
                                    onPageChange={handleProPageChange}
                                />
                            )}
                        </div>
                    </Layout>
                </div>
                {selectedSignal && (
                    <SignalModal 
                        signal={selectedSignal}
                        onClose={() => setSelectedSignal(null)}
                        cache={appState[activeTab].ohlcCache}
                        updateCache={updateCache}
                    />
                )}
                {selectedSignalV2 && (
                    <SignalModalV2 
                        signal={selectedSignalV2}
                        onClose={() => setSelectedSignalV2(null)}
                    />
                )}
                <BackToTopButton />
            </div>
        </ThemeContext.Provider>
    );
}