import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AutocompleteOption {
  key: string;
  value: string;
  label: string;
}

interface SmartAutocompleteProps {
  items: AutocompleteOption[];
  label?: string;
  placeholder?: string;
  className?: string;
  selectedKey?: string;
  inputValue?: string;
  onSelectionChange?: (key: string | null) => void;
  onInputChange?: (value: string) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
  value?: string;
  description?: string;
}

export default function SmartAutocomplete({
  items,
  label = "Select an option",
  placeholder = "Search...",
  className,
  selectedKey,
  inputValue,
  onSelectionChange,
  onInputChange,
  isDisabled = false,
  isRequired = false,
  errorMessage,
}: SmartAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [internalQuery, setInternalQuery] = React.useState(inputValue ?? "");

  React.useEffect(() => {
    if (inputValue !== undefined) setInternalQuery(inputValue);
  }, [inputValue]);

  const selectedItem = items.find(
    (item) => item.value === selectedKey || item.key === selectedKey,
  );
  const displayValue = selectedItem?.label || internalQuery;

  return (
    <div className={cn("flex w-full max-w-xs flex-col gap-1.5", className)}>
      {label && (
        <Label>
          {label}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isDisabled}
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              errorMessage && "border-destructive",
            )}
          >
            <span
              className={cn(
                "truncate",
                !displayValue && "text-muted-foreground",
              )}
            >
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={internalQuery}
              onValueChange={(v) => {
                setInternalQuery(v);
                onInputChange?.(v);
              }}
            />
            <CommandList>
              <CommandEmpty>No options.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onSelectionChange?.(item.value);
                      setInternalQuery(item.label);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedKey === item.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
