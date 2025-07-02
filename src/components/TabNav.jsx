// File: src/components/TabNav.jsx

export const TabNav = ({ models, activeTab, setActiveTab, onCompareClick }) => (
    <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex gap-2 flex-wrap">
            {Object.entries(models).map(([id, { name, experimental }]) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${activeTab === id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                >
                    {name} {experimental && "(Exp)"}
                </button>
            ))}
        </div>
        {/* Conditionally render the compare button only if the prop is provided */}
        {onCompareClick && (
            <button onClick={onCompareClick} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-500 transition-colors">
                Compare Models
            </button>
        )}
    </div>
);