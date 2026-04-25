import React from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropdownCellProps {
  handleOptionChange: () => void;
  selectedKey: string;
  options: any[];
}
const DropdownCell: React.FC<DropdownCellProps> = ({
  handleOptionChange,
  selectedKey,
  options,
}) => {
  const [selectedKeys, setSelectedKeys] = React.useState(selectedKey);

  const handleSelectionChange = (value: string) => {
    setSelectedKeys(value);
    handleOptionChange();
  };

  const triggerColor = () => {
    if (selectedKeys === "Admitted") return "bg-green-100 text-green-900";
    if (selectedKeys === "Deceased") return "bg-red-100 text-red-900";
    if (selectedKeys === "Discharged") return "bg-blue-100 text-blue-900";
    if (selectedKeys === "Success" || selectedKeys === "Active")
      return "bg-green-100 text-green-900";
    if (selectedKeys === "Failed" || selectedKeys === "Inactive")
      return "bg-red-100 text-red-900";

    return "";
  };

  return (
    <Select value={selectedKeys} onValueChange={handleSelectionChange}>
      <SelectTrigger className={cn("max-w-[9rem] m-0", triggerColor())}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opn) => (
          <SelectItem key={opn} value={opn}>
            {opn}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DropdownCell;
