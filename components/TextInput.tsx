import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  <div className="flex h-fit flex-col gap-1.5">
    {label && <Label htmlFor={id}>{label}</Label>}
    <Input
      disabled={Boolean(disabled)}
      id={id}
      placeholder={placeholder}
      type={type}
      value={value !== undefined ? String(value) : ""}
      onChange={onChange}
    />
  </div>
);

export default TextField;
