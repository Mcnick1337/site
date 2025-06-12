// File: src/components/Layout.jsx

const NavLink = ({ text, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ease-in-out
                    ${isActive ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
    >
        {icon}
        <span className="ml-3">{text}</span>
    </button>
);

export const Layout = ({ activeView, setActiveView, children }) => {
    const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
    const ToolsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
    
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-dark-card/50 p-4 border-r border-white/10 flex-shrink-0">
                <div className="mb-8 font-bold text-xl text-center text-white/80">
                    MCN AI Stats
                </div>
                <nav className="space-y-2">
                    <NavLink text="Dashboard" icon={<DashboardIcon />} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavLink text="Portfolio Tools" icon={<ToolsIcon />} isActive={activeView === 'portfolio'} onClick={() => setActiveView('portfolio')} />
                </nav>
            </aside>

            {/* --- THIS IS THE FIX --- */}
            {/* Added 'flex flex-col' to ensure a consistent vertical layout for its children */}
            <main className="flex-grow flex flex-col">
                {children}
            </main>
        </div>
    );
};