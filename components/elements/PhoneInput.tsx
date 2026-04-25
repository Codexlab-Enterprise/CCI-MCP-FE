import { forwardRef } from "react";
import {
  CountryIso2,
  FlagImage,
  defaultCountries,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export interface PhoneInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (phone: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, onValueChange, ...props }, ref) => {
    const {
      inputValue,
      country,
      setCountry,
      handlePhoneValueChange,
      inputRef,
    } = usePhoneInput({
      defaultCountry: "in",
      countries: defaultCountries,
      value: value || "",
      onChange: (data) => {
        if (onValueChange) {
          onValueChange(data.phone);
        }
        if (onChange) {
          const event = {
            target: {
              value: data.phone,
              name: props.name || "",
            },
            type: "change",
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(event);
        }
      },
      preferredCountries: ["in"],
    });

    const combinedRef = (instance: HTMLInputElement | null) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
      inputRef.current = instance;
    };

    return (
      <div className="flex w-full items-center">
        <Select
          value={country.iso2}
          onValueChange={(v) => setCountry(v as CountryIso2)}
        >
          <SelectTrigger className="w-24 rounded-r-none border-r-0">
            <FlagImage iso2={country.iso2} className="h-5 w-5" />
          </SelectTrigger>
          <SelectContent className="w-96">
            {defaultCountries.map((c) => {
              const countryData = parseCountry(c);

              return (
                <SelectItem key={countryData.iso2} value={countryData.iso2}>
                  <div className="flex items-center gap-2">
                    <FlagImage className="h-5 w-5" iso2={countryData.iso2} />
                    <span>{countryData.name}</span>
                    <span className="text-muted-foreground">
                      {countryData.dialCode}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Input
          ref={combinedRef}
          className={cn("rounded-l-none", className)}
          type="tel"
          value={inputValue}
          onChange={handlePhoneValueChange}
          {...props}
        />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
