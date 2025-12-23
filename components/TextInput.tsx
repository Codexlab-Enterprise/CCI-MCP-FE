import { Input } from "@heroui/input";
import React from "react";

interface TextFieldProps {
  label: string;
  id?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean | string;
}
const TextField: React.FC<TextFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}) => (
  <div className="h-fit">
    {/* <label htmlFor={id} className="block text-sm font-medium">
      {label}
    </label> */}
    <Input
      className=""
      disabled={Boolean(disabled)}
      id={id}
      label={label}
      placeholder={placeholder}
      type={type}
      value={value !== undefined ? String(value) : ""}
      onChange={onChange}
    />
  </div>
);

export default TextField;
