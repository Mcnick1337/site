// File: src/components/Header.jsx

import { useContext } from 'react';
import { ThemeContext } from '../App'; // Import the context from App.jsx

export const Header = () => {
    // Use the context to get the current theme and the toggle function
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold">Signal Board</h1>
                <p className="text-gray-500 dark:text-gray-400">Advanced AI-Powered Trading Signals</p>
            </div>
            
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-dark-card border border-transparent dark:border-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
            </button>
        </header>
    );
};