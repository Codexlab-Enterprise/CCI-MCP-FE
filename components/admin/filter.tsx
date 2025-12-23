import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import React from "react";

import Badge from "./badge";

interface FilterProps {
  filter: {
    category: string;
    membership: string;
    status: string;
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      category: string;
      membership: string;
      status: string;
    }>
  >;
  handleApplyFilter: () => void;
}

// Custom Badge Component

const FilterForm: React.FC<FilterProps> = ({
  filter,
  setFilter,
  handleApplyFilter,
}) => {
  // Sample data - replace with your actual data
  const categories = ["Life", "Old"];
  const memberships = ["Basic", "Premium", "Gold", "Platinum"];
  const statusOptions = ["paid", "due"];

  const handleFilterChange = (
    type: "category" | "membership" | "status",
    value: string,
  ) => {
    setFilter((prev) => ({
      ...prev,
      [type]: prev[type] === value ? "" : value,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Category</h1>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                isActive={filter.category === cat}
                label={cat}
                onClick={() => handleFilterChange("category", cat)}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Membership Filter */}
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Membership Type</h1>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {memberships.map((mem) => (
              <Badge
                key={mem}
                isActive={filter.membership === mem}
                label={mem}
                onClick={() => handleFilterChange("membership", mem)}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Payment Status</h1>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((stat) => (
              <Badge
                key={stat}
                color={stat === "paid" ? "success" : "danger"}
                isActive={filter.status === stat}
                label={stat.charAt(0).toUpperCase() + stat.slice(1)}
                onClick={() => handleFilterChange("status", stat)}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
          variant="bordered"
          onPress={() => {
            setFilter({ category: "", membership: "", status: "" });
          }}
        >
          Reset All
        </Button>
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onPress={handleApplyFilter}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterForm;
