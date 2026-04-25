import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import MultiSelectDropdown from "./SearchableDropdown";

interface FilterCardProps {
  title: string;
  options: string[];
  filters: { [key: string]: string[] };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  filterKey: string;
}

const FilterCard: React.FC<FilterCardProps> = ({
  title,
  options,
  filters,
  setFilters,
  filterKey,
}) => {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="flex gap-2 pt-1">
          <MultiSelectDropdown
            filterKey={filterKey}
            filters={filters}
            options={options}
            setFilters={setFilters}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterCard;
