// SearchableDropdown.tsx
import { Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const SearchableDropdown = ({
  options,
  label,
  title,
  id,
  selectedVal,
  isRequired,
  handleChange,
  query,
  setQuery,
  errorMessage,
  placeholder = "Type to search",
}: {
  options: any[];
  label: string;
  title: string;
  id: string;
  isRequired?: boolean;
  selectedVal: any;
  handleChange: (val: any) => void;
  errorMessage?: string;
  placeholder?: string;
  query?: string;
  setQuery?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const filteredOptions = options.filter((option) =>
  //   option[label].toLowerCase().includes(query.toLowerCase())
  // );

  const displayValue = selectedVal ? selectedVal[label] : "";

  return (
    <div
      ref={dropdownRef}
      className="relative w-full p-2 bg-zinc-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <label className="block text-xs  text-gray-500">
        {title} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          className={`w-full text-xs lg:text-md placeholder:max-w-10 placeholder:truncate bg-transparent focus:outline-none ${
            errorMessage ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={placeholder}
          type="text"
          value={isOpen ? query : displayValue}
          onChange={(e) => {
            setQuery?.(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
        />
        <button
          className={`absolute right-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="h-5 w-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {options && options?.length > 0 ? (
            options.map((option) => (
              <button
                key={option[id]}
                className={`px-4 flex justify-between w-full py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedVal && selectedVal[id] === option[id]
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-900"
                }`}
                onClick={() => {
                  handleChange(option);
                  setQuery?.("");
                  setIsOpen(false);
                }}
              >
                {option[label]}
                {selectedVal && selectedVal[id] === option[id] && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No options found</div>
          )}
        </div>
      )}
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default SearchableDropdown;
