import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const FilterForm: React.FC<FilterProps> = ({
  filter,
  setFilter,
  handleApplyFilter,
}) => {
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
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-semibold">Category</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-semibold">
            Membership Type
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-semibold">
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setFilter({ category: "", membership: "", status: "" });
          }}
        >
          Reset All
        </Button>
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleApplyFilter}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterForm;
