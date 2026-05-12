import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const CheckboxGroup = ({
  label,
  options,
  selectedOptions,
  disabled,
  onChange,
}: any) => {
  return (
    <div className="col-span-full">
      <Label className="block text-md font-medium">{label}</Label>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {options.map((option: string) => (
          <div key={option} className="flex items-center">
            <Checkbox
              id={option}
              checked={selectedOptions.includes(option)}
              disabled={disabled}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter((item: string) => item !== option),
                )
              }
            />
            <Label className="ml-2 text-sm font-medium" htmlFor={option}>
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
