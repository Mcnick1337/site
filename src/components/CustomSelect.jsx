// File: src/components/CustomSelect.jsx (Updated for polish)

import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
// Import a proper icon component
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

// We can simplify the button styles now that we are using a real icon component
const selectButtonStyles = `
  relative w-full cursor-default bg-transparent text-white rounded-md border-0 py-1.5 pl-3 pr-10
  ring-1 ring-inset ring-white/20 
  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500
  text-left
`;

export const CustomSelect = ({ id, value, onChange, options }) => {
  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => ( // Expose the 'open' state from Listbox
        <div className="relative w-full">
          <Listbox.Button id={id} className={selectButtonStyles.replace(/\s+/g, ' ').trim()}>
            <span className="block truncate">{selectedOption.label}</span>
            {/* The new, animated chevron icon */}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          {/* UPDATED: Added a more fluid scale and opacity transition */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  // ADDED: transition-colors for smoother hover effect
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 transition-colors duration-150 ${
                      active ? 'bg-cyan-600/50 text-white' : 'text-gray-300'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};