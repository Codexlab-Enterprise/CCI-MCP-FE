import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DISPLAY_FORMAT = "dd-MM-yyyy";
const STORAGE_FORMAT = "yyyy-MM-dd";

const parseValue = (value?: string): Date | undefined => {
  if (!value) return undefined;
  // ISO storage format
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);

    return isValid(d) ? d : undefined;
  }
  // Display format (user-typed)
  const fromDisplay = parse(value, DISPLAY_FORMAT, new Date());

  if (isValid(fromDisplay)) return fromDisplay;
  // Last resort
  const generic = new Date(value);

  return isValid(generic) ? generic : undefined;
};

export interface DateFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholder?: string;
  /** Earliest year shown in the year dropdown. Defaults to 1900. */
  fromYear?: number;
  /** Latest year shown in the year dropdown. Defaults to current year + 10. */
  toYear?: number;
  /** Show today/clear shortcut buttons in the popover. */
  showShortcuts?: boolean;
  /** Allow user to type the date manually. */
  allowInput?: boolean;
  /** Compact size for table cells: smaller height, hidden clear button. */
  compact?: boolean;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  required,
  disabled,
  minDate,
  maxDate,
  className,
  placeholder = "dd-mm-yyyy",
  fromYear = 1900,
  toYear = new Date().getFullYear() + 10,
  showShortcuts = true,
  allowInput = true,
  compact = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => parseValue(value), [value]);
  const formattedDisplay = dateValue ? format(dateValue, DISPLAY_FORMAT) : "";
  const currentStorageValue = dateValue ? format(dateValue, STORAGE_FORMAT) : "";

  const [inputValue, setInputValue] = React.useState(formattedDisplay);

  React.useEffect(() => {
    setInputValue(formattedDisplay);
  }, [formattedDisplay]);

  const commit = (next: Date | undefined) => {
    if (!next) {
      onChange("");
      setInputValue("");

      return;
    }
    onChange(format(next, STORAGE_FORMAT));
    setInputValue(format(next, DISPLAY_FORMAT));
  };

  const handleInputBlur = () => {
    if (!allowInput) return;
    if (inputValue.trim() === "") {
      if (!currentStorageValue) return;
      commit(undefined);

      return;
    }
    const parsed = parseValue(inputValue);

    if (parsed && isValid(parsed)) {
      const nextStorageValue = format(parsed, STORAGE_FORMAT);

      if (nextStorageValue === currentStorageValue) {
        setInputValue(formattedDisplay);

        return;
      }

      commit(parsed);
    } else {
      setInputValue(formattedDisplay);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    commit(undefined);
  };

  const handleToday = () => {
    const t = new Date();

    if (maxDate && t > maxDate) return;
    if (minDate && t < minDate) return;
    commit(t);
    setOpen(false);
  };

  const disabledMatcher = React.useMemo(() => {
    if (minDate && maxDate) return { before: minDate, after: maxDate };
    if (minDate) return { before: minDate };
    if (maxDate) return { after: maxDate };

    return undefined;
  }, [minDate, maxDate]);

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={label ?? "Pick a date"}
              className={cn(
                "flex w-full items-center justify-between rounded-md border border-input bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                compact ? "h-8 px-2 py-1 text-xs" : "h-10 px-3 py-2 text-sm",
              )}
              onClick={(e) => {
                if (allowInput) {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }
              }}
            >
              {allowInput ? (
                <input
                  type="text"
                  value={inputValue}
                  disabled={disabled}
                  placeholder={placeholder}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={handleInputBlur}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInputBlur();
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "min-w-0 flex-1 bg-transparent text-left outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
                    compact && "text-xs",
                  )}
                />
              ) : (
                <span className={cn("truncate", !dateValue && "text-muted-foreground")}>
                  {dateValue ? format(dateValue, DISPLAY_FORMAT) : placeholder}
                </span>
              )}
              <span className={cn("flex shrink-0 items-center", compact ? "ml-1" : "ml-2")}>
                {!compact && dateValue && !disabled ? (
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label="Clear date"
                    onClick={handleClear}
                    className="mr-1 cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                ) : null}
                <CalendarIcon className={cn("opacity-60", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </span>
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateValue}
            defaultMonth={dateValue ?? new Date()}
            captionLayout="dropdown"
            startMonth={new Date(fromYear, 0)}
            endMonth={new Date(toYear, 11)}
            disabled={disabledMatcher}
            onSelect={(d) => {
              commit(d);
              setOpen(false);
            }}
          />
          {showShortcuts && (
            <div className="flex items-center justify-between gap-2 border-t p-2">
              <button
                type="button"
                onClick={() => {
                  commit(undefined);
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Today
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateField;
