// File: src/components/v2/Accordion.jsx
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export const Accordion = ({ title, titleColor, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
            >
                <h4 className={`font-semibold ${titleColor} flex items-center gap-2`}>
                    {icon}
                    {title}
                </h4>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 pt-2' : 'max-h-0'}`}>
                <div className="border-l border-white/10 pl-3 ml-2">
                    {children}
                </div>
            </div>
        </div>
    );
};