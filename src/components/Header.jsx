export const Header = () => (
    <header className="text-center mb-8 relative">
        <div className="absolute -inset-4 overflow-hidden -z-10">
            <div className="absolute inset-8 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-10 blur-3xl rounded-full"></div>
        </div>
        <div className="py-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                Trading Signals Dashboard
            </h1>
            <p className="text-lg text-gray-400 mt-2">AI Trading Performance Analysis</p>
        </div>
    </header>
);