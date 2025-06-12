// File: src/components/Header.jsx (Updated)

import { useContext } from 'react';
import { ThemeContext } from '../App';

export const Header = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        // UPDATED: Changed to justify-end as the title has been removed.
        // Removed mb-8 as the dashboard view will now manage its own spacing.
        <header className="flex justify-end items-center">
            {/* REMOVED: The title and subtitle div is no longer here. */}
            
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