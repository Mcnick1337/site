// File: src/components/CustomSelect.jsx

import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Reusing the select styles from FilterControls.jsx for consistency
const selectButtonStyles = `
  relative w-full cursor-default bg-transparent text-white rounded-md border-0 py-1.5 px-2.5 
  ring-1 ring-inset ring-white/20 
  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500
  text-left
  appearance-none 
  bg-no-repeat 
  bg-[right_0.5rem_center] 
  bg-[length:1.5em_1.5em] 
  pr-10
  bg-[url("data:image/svg+xml,%3csvg_xmlns='http://www.w3.org/2000/svg'_fill='none'_viewBox='0_0_20_20'%3e%3cpath_stroke='%239ca3af'_stroke-linecap='round'_stroke-linejoin='round'_stroke-width='1.5'_d='M6_8l4_4_4-4'/%3e%3c/svg%3e")]
`;

export const CustomSelect = ({ id, value, onChange, options }) => {
  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full">
        <Listbox.Button id={id} className={selectButtonStyles.replace(/\s+/g, ' ').trim()}>
          <span className="block truncate">{selectedOption.label}</span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* These options are now rendered in a div we can control. */}
          {/* We give it a high z-index to ensure it appears on top. */}
          <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option, optionIdx) => (
              <Listbox.Option
                key={optionIdx}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 px-4 ${
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
    </Listbox>
  );
};