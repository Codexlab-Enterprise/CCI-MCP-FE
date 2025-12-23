import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";

// import SearchableDropdown from './SearchableDropdown';
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
  console.log("key", filterKey);

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">{title}</CardHeader>
      <CardBody className="pt-0">
        {/* <CardBody> */}
        <div className="flex gap-2 pt-1">
          <MultiSelectDropdown
            filterKey={filterKey}
            filters={filters}
            options={options}
            setFilters={setFilters}
          />
        </div>

        {/* </CardBody> */}
      </CardBody>
    </Card>
  );
};

export default FilterCard;
