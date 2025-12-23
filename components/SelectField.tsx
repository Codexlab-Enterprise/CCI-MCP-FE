import { Select, SelectItem } from "@heroui/select";

interface SelectFieldProps {
  label?: string;
  id?: string;
  name?: string;
  value?: Set<string>; // Change from Set<any> to Set<string>
  onChange: (value: Set<string>) => void;
  options: any[] | { key: string; label: string }[];
  className?: string;
  disabled?: boolean;
  isRequired?: boolean;
  defaultValue?: Set<string>;
  outsideLabel?: string;
  type?: "single" | "multiple";
}
const SelectField = ({
  label,
  id,
  value,
  defaultValue,
  onChange,
  type = "single",
  isRequired,
  options,
  name,
  className,
  disabled,
  outsideLabel,
}: SelectFieldProps) => {
  console.log("value", value);

  return (
    <div className="flex items-center gap-2">
      {/* <label htmlFor={id} className="block text-sm font-medium ">
      {label}
    </label> */}
      {/* <select
      id={id}
      className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
      value={value}
      onChange={onChange}
    > */}
      {outsideLabel && <label className="text-nowrap">{outsideLabel}</label>}
      <Select
        className={`w-full  ${className}`}
        defaultSelectedKeys={defaultValue}
        isRequired={isRequired}
        label={label}
        name={name}
        selectedKeys={value}
        selectionMode={type}
        variant="bordered"
        onSelectionChange={onChange}
        // disabled={disabled}
        isDisabled={disabled}
      >
        {options.map((option: any) => (
          <SelectItem key={typeof option == "object" ? option.key : option}>
            {typeof option == "object" ? option.label : option}
          </SelectItem>
        ))}
      </Select>
      {/* {options.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))} */}
      {/* </select> */}
    </div>
  );
};

export default SelectField;
