import * as React from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

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

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  items: ComboboxOption[];
  value?: string | null;
  onChange?: (value: string | null, option: ComboboxOption | null) => void;
  /**
   * If provided, the Combobox runs in async mode: the parent owns filtering
   * (typically by calling an API), and cmdk's built-in filter is disabled.
   * If omitted, cmdk filters `items` client-side using its own scorer.
   */
  onSearchChange?: (query: string) => void;
  /** Initial query value — useful when the parent debounces externally. */
  searchValue?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  errorMessage?: string;
  /** Allow clearing the selection inline. */
  clearable?: boolean;
  /** Render override for each item. */
  renderItem?: (option: ComboboxOption) => React.ReactNode;
}

export const Combobox: React.FC<ComboboxProps> = ({
  items,
  value,
  onChange,
  onSearchChange,
  searchValue,
  loading = false,
  loadingText = "Loading…",
  emptyText = "No results found.",
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  label,
  required,
  disabled,
  className,
  errorMessage,
  clearable = true,
  renderItem,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalQuery, setInternalQuery] = React.useState(searchValue ?? "");
  const isAsync = typeof onSearchChange === "function";

  React.useEffect(() => {
    if (searchValue !== undefined) setInternalQuery(searchValue);
  }, [searchValue]);

  const selected = items.find((item) => item.value === value) ?? null;

  const handleSelect = (item: ComboboxOption) => {
    onChange?.(item.value, item);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(null, null);
  };

  const handleQueryChange = (q: string) => {
    setInternalQuery(q);
    onSearchChange?.(q);
  };

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-label={label ?? placeholder}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              errorMessage && "border-destructive",
            )}
          >
            <span
              className={cn("truncate", !selected && "text-muted-foreground")}
            >
              {selected ? selected.label : placeholder}
            </span>
            <span className="ml-2 flex shrink-0 items-center gap-1">
              {clearable && selected && !disabled ? (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear selection"
                  onClick={handleClear}
                  className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              ) : null}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command shouldFilter={!isAsync}>
            <CommandInput
              value={internalQuery}
              onValueChange={handleQueryChange}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingText}
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => handleSelect(item)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selected?.value === item.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {renderItem ? renderItem(item) : item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};

export default Combobox;
