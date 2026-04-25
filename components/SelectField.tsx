import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectFieldProps {
  label?: string;
  id?: string;
  name?: string;
  value?: Set<string>;
  onChange: (value: Set<string>) => void;
  options: any[] | { key: string; label: string }[];
  className?: string;
  disabled?: boolean;
  isRequired?: boolean;
  defaultValue?: Set<string>;
  outsideLabel?: string;
  type?: "single" | "multiple";
}

const normalize = (option: any) =>
  typeof option === "object"
    ? { key: String(option.key), label: option.label }
    : { key: String(option), label: String(option) };

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
  const opts = options.map(normalize);
  const selected = value ?? defaultValue ?? new Set<string>();

  if (type === "multiple") {
    const selectedLabels = opts
      .filter((o) => selected.has(o.key))
      .map((o) => o.label);

    const toggle = (key: string) => {
      const next = new Set(selected);

      if (next.has(key)) next.delete(key);
      else next.add(key);
      onChange(next);
    };

    return (
      <div className="flex w-full items-center gap-2">
        {outsideLabel && <Label className="text-nowrap">{outsideLabel}</Label>}
        <div className={cn("flex w-full flex-col gap-1.5", className)}>
          {label && (
            <Label htmlFor={id}>
              {label}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                id={id}
                type="button"
                disabled={disabled}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={cn(selectedLabels.length === 0 && "text-muted-foreground")}>
                  {selectedLabels.length === 0
                    ? "Select..."
                    : selectedLabels.join(", ")}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
              <div className="max-h-60 overflow-y-auto">
                {opts.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => toggle(o.key)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={selected.has(o.key)}
                      onCheckedChange={() => toggle(o.key)}
                    />
                    <span>{o.label}</span>
                    {selected.has(o.key) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <input type="hidden" name={name} value={Array.from(selected).join(",")} />
        </div>
      </div>
    );
  }

  const singleValue = Array.from(selected)[0] ?? "";

  return (
    <div className="flex w-full items-center gap-2">
      {outsideLabel && <Label className="text-nowrap">{outsideLabel}</Label>}
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label && (
          <Label htmlFor={id}>
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Select
          name={name}
          value={singleValue}
          disabled={disabled}
          onValueChange={(v) => onChange(new Set([v]))}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.key} value={o.key}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SelectField;
