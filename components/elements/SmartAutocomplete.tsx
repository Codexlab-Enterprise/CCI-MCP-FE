import React from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";

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
  variant?: "flat" | "bordered" | "underlined" | "faded";
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
  value,
  label = "Select an option",
  placeholder = "Search...",
  className = "max-w-xs",
  variant = "bordered",
  selectedKey,
  inputValue,
  onSelectionChange,
  onInputChange,
  isDisabled = false,
  isRequired = false,
  errorMessage,
  description,
}: SmartAutocompleteProps) {
  const [fieldState, setFieldState] = React.useState({
    selectedKey: selectedKey || "",
    inputValue: inputValue || "",
    items: items,
  });

  // Simple filtering function
  const filterItems = (allItems: AutocompleteOption[], query: string) => {
    if (!query || query.trim() === "") {
      return allItems;
    }

    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.key.toLowerCase().includes(query.toLowerCase()) ||
        item.value.toLowerCase().includes(query.toLowerCase()),
    );
  };

  // Handle selection change
  const handleSelectionChange = (key: string | null) => {
    const selectedItem = items.find((option) => option.value === key);

    setFieldState((prevState) => ({
      inputValue: selectedItem?.label || "",
      selectedKey: key || "",
      items: selectedItem ? filterItems(items, selectedItem.label) : items,
    }));

    // Call parent callback
    onSelectionChange?.(key);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === "" ? "" : prevState.selectedKey,
      items: filterItems(items, value),
    }));

    // Call parent callback
    onInputChange?.(value);
  };

  // Handle open state change
  const handleOpenChange = (
    isOpen: boolean,
    menuTrigger?: "focus" | "input" | "manual",
  ) => {
    if (menuTrigger === "manual" && isOpen) {
      setFieldState((prevState) => ({
        ...prevState,
        items: items, // Show all items when opened manually
      }));
    }
  };

  // Update internal state when props change
  React.useEffect(() => {
    if (selectedKey !== undefined) {
      const selectedItem = items.find(
        (item) => item.value === selectedKey || item.key === selectedKey,
      );

      setFieldState((prev) => ({
        ...prev,
        selectedKey: selectedKey,
        inputValue: selectedItem?.label || "",
      }));
    }
  }, [selectedKey, items]);

  React.useEffect(() => {
    if (inputValue !== undefined) {
      setFieldState((prev) => ({
        ...prev,
        inputValue: inputValue,
        items: filterItems(items, inputValue),
      }));
    }
  }, [inputValue, items]);

  // Update items when the items prop changes
  React.useEffect(() => {
    setFieldState((prev) => ({
      ...prev,
      items: filterItems(items, prev.inputValue),
    }));
  }, [items]);

  return (
    <Autocomplete
      allowsCustomValue={false}
      className={className}
      inputValue={fieldState.inputValue}
      isDisabled={isDisabled}
      isRequired={isRequired}
      items={fieldState.items}
      label={label}
      menuTrigger="input"
      placeholder={placeholder}
      selectedKey={fieldState.selectedKey}
      value={value}
      variant={variant}
      onOpenChange={handleOpenChange}
      onSelectionChange={handleSelectionChange}
      errorMessage={errorMessage}
    //   description={description}
      onInputChange={handleInputChange}
    >
      {(item) => (
        <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
}
