import { SignalCard } from './SignalCard';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Previous
            </button>
            <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
        </div>
    );
}

export const SignalCatalog = ({ signals, currentPage, itemsPerPage, onPageChange, onSignalClick, highlightedSignalId }) => {
    const paginatedSignals = signals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(signals.length / itemsPerPage);

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Signal Catalog</h2>
            {signals.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedSignals.map((signal, index) => (
                            <SignalCard
                                key={signal.timestamp}
                                signal={signal}
                                index={index}
                                onClick={() => onSignalClick(signal)}
                                isHighlighted={highlightedSignalId === signal.timestamp}
                            />
                        ))}
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </>
            ) : (
                <p className="text-center text-gray-400 py-8">No signals match your criteria.</p>
            )}
        </div>
    );
};