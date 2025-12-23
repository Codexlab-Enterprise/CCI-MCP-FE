import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/router";

interface FilterBadgeProps {
  type: "category" | "membership" | "status";
  value: string;
  filters: {
    page: number;
    pageSize: number;
    category: string;
    membership: string;
    status: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      page: number;
      pageSize: number;
      category: string;
      membership: string;
      status: string;
    }>
  >;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({
  type,
  value,
  filters,
  setFilters,
}) => {
  const router = useRouter();

  // Handle removing this specific filter
  const handleRemoveFilter = () => {
    // Create new filters object without this filter
    const newFilters = {
      ...filters,
      [type]: "",
    };

    // Update local state
    setFilters(newFilters);

    // Create URLSearchParams from current query
    const params = new URLSearchParams(window.location.search);

    // Remove the filter from URL params
    params.delete(type);

    // Always keep pagination params
    params.set("page", newFilters.page.toString());
    params.set("pageSize", newFilters.pageSize.toString());

    // Update the URL
    router.push(`/members?${params.toString()}`);
  };

  // Color variants based on filter type
  const getColorVariant = () => {
    switch (type) {
      case "status":
        return value.toLowerCase() === "paid" ? "green" : "red";
      case "membership":
        return "blue";
      case "category":
        return "purple";
      default:
        return "gray";
    }
  };

  const colorVariant = getColorVariant();

  // Dynamic classes based on color variant
  const colorClasses = {
    bg: {
      green: "bg-green-100",
      red: "bg-red-100",
      blue: "bg-blue-100",
      purple: "bg-purple-100",
      gray: "bg-gray-100",
    },
    text: {
      green: "text-green-800",
      red: "text-red-800",
      blue: "text-blue-800",
      purple: "text-purple-800",
      gray: "text-gray-800",
    },
    hover: {
      green: "hover:bg-green-200",
      red: "hover:bg-red-200",
      blue: "hover:bg-blue-200",
      purple: "hover:bg-purple-200",
      gray: "hover:bg-gray-200",
    },
  };

  return (
    <div
      className={`inline-flex ${colorClasses.bg[colorVariant]} ${colorClasses.text[colorVariant]} border items-center rounded-full px-3 py-1 text-sm font-medium transition-colors mr-2 mb-2 ${colorClasses.hover[colorVariant]}`}
    >
      <span className="capitalize">{value}</span>
      <button
        aria-label={`Remove ${value} filter`}
        className="ml-1.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none"
        onClick={handleRemoveFilter}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default FilterBadge;
