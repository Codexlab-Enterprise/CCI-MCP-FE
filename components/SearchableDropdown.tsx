import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: string[];
  filters: { [key: string]: string[] };
  filterKey: string;
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  filters,
  setFilters,
  filterKey,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  console.log("key", filterKey);
  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (!filters[filterKey]?.includes(value)) {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: [...(prev[filterKey] || []), value],
      }));
    }
    setQuery("");
  };

  const handleRemove = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: (prev[filterKey] || []).filter((item) => item !== value),
    }));
  };

  const filteredOptions = options.filter(
    (option) =>
      !filters[filterKey]?.includes(option) &&
      option.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex flex-wrap gap-2 mt-2">
        {filters[filterKey] &&
          filters[filterKey]?.map((value, index) => {
            const label = options.find((o) => o === value) || value;

            return (
              <span
                key={index}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1"
              >
                {label}
                <button
                  className="ml-1 text-white hover:text-gray-200"
                  onClick={() => handleRemove(value)}
                >
                  ×
                </button>
              </span>
              // <FilterBadge key={filterKey} value={value} label={label} filters={filters} setFilters={setFilters}/>
            );
          })}
      </div>
      <input
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search filters..."
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="fixed z-30 mt-1 w-96 flex flex-col bg-white dark:bg-black border rounded-md shadow max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100 w-full"
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow px-4 py-2 text-gray-400">
          No matching filters
        </div>
      )}

      {/* Selected filters as badges */}
    </div>
  );
};

export default MultiSelectDropdown;
