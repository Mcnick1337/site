// File: src/components/Tooltip.jsx

import { useState } from 'react';

export const Tooltip = ({ text, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-30">
          <div className="bg-gray-800 text-white text-xs rounded-md py-1.5 px-3 shadow-lg whitespace-pre-wrap">
            {text}
          </div>
          {/* This is the small triangle pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};