import { forwardRef } from "react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  CountryIso2,
  FlagImage,
  defaultCountries,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

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
      phone,
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
        // Create a synthetic event for React Hook Form
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

    // Combine refs
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
          className="w-32 "
          classNames={{
            trigger: " w-full py-[1.65rem] rounded-r-none ",
            listboxWrapper: "w-full",
            listbox: "w-96",
            mainWrapper: "w-full",
            value: "text-left",
            popoverContent: "w-96",
          }}
          renderValue={() => (
            <div className="flex items-center">
              <FlagImage iso2={country.iso2} className="h-5 w-5" />
            </div>
          )}
          selectedKeys={[country.iso2]}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            setCountry(selectedKey as CountryIso2);
          }}
          variant="bordered"
          // size="md"
        >
          {defaultCountries.map((c) => {
            const countryData = parseCountry(c);

            return (
              <SelectItem key={countryData.iso2}>
                <div className="flex items-center gap-2">
                  <FlagImage className="h-5 w-5" iso2={countryData.iso2} />
                  <span>{countryData.name}</span>
                  <span className="text-default-500">
                    {countryData.dialCode}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </Select>

        <Input
          ref={combinedRef}
          className={className}
          classNames={{
            input: "rounded-l-none",
            inputWrapper: "rounded-l-none border-l-0",
          }}
          type="tel"
          value={inputValue}
          variant="bordered"
          onChange={handlePhoneValueChange}
          {...props}
        />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
