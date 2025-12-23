import React from "react";
import { Select, SelectItem } from "@heroui/select";

interface DropdownCellProps {
  handleOptionChange: () => void;
  selectedKey: string;
  options: any[];
  // colorSelectionCondition?:()=>string
}
const DropdownCell: React.FC<DropdownCellProps> = ({
  handleOptionChange,
  selectedKey,
  options,
}) => {
  const [selectedKeys, setSelectedKeys] = React.useState(selectedKey);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKeys(e.target.value);
    handleOptionChange();
  };

  const dropDownColor = () => {
    if (selectedKeys === "Admitted") {
      return "success";
    }
    if (selectedKeys === "Deceased") {
      return "danger";
    }
    if (selectedKeys === "Discharged") {
      return "primary";
    }
    if (selectedKeys === "Success" || selectedKeys === "Active") {
      return "success";
    }
    if (selectedKeys === "Failed" || selectedKeys === "Inactive") {
      return "danger";
    }
  };

  return (
    <Select
      className="max-w-[9rem] m-0"
      color={dropDownColor()}
      // selectorIcon={<></>}

      selectedKeys={[selectedKeys]}
      onChange={handleSelectionChange}
    >
      {options.map((opn) => (
        <SelectItem key={opn}>{opn}</SelectItem>
      ))}
    </Select>
  );
};

export default DropdownCell;
