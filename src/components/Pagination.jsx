// File: src/components/Pagination.jsx

import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= Math.floor(maxPagesToShow / 2)) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - Math.floor(maxPagesToShow / 2);
                endPage = currentPage + Math.floor(maxPagesToShow / 2);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    className={`px-4 py-2 mx-1 rounded-lg transition-colors ${currentPage === i ? 'bg-cyan-600 text-white' : 'bg-dark-card text-gray-300 hover:bg-white/10'}`}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center my-8">
            <button
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 rounded-lg bg-dark-card text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                « Prev
            </button>
            {renderPageNumbers()}
            <button
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 rounded-lg bg-dark-card text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next »
            </button>
        </div>
    );
};