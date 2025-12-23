import { Checkbox } from "@heroui/react";

export const CheckboxGroup = ({
  label,
  options,
  selectedOptions,
  disabled,
  onChange,
}: any) => {
  return (
    <div className="col-span-full">
      <label className="block text-md font-medium ">{label}</label>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {options.map((option: string) => (
          <div key={option} className="flex items-center">
            <Checkbox
              checked={selectedOptions.includes(option)}
              className="border-gray-300 rounded"
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter((item: string) => item !== option),
                )
              }
              isDisabled={disabled}
              // type="checkbox"
              id={option}
            />
            <label className="ml-2 text-sm font-medium " htmlFor={option}>
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
