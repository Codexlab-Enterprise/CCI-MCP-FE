import React from "react";

interface FilterBadgeProps {
  value: string;
  label: string;
  key: string;
  filters: { [key: string]: string[] };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({
  value,
  label,
  key,
  filters,
  setFilters,
}) => {
  const handleClick = () => {
    if (!filters[key]?.includes(value)) {
      setFilters((prev) => {
        return {
          ...prev,
          [key]: [...(prev[key] || []), value],
        };
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((filter) => filter !== value),
      }));
    }
  };
  const isActive = filters[key]?.includes(value);

  // const isActive = filters.includes(value)

  return (
    <button
      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};

export default FilterBadge;
