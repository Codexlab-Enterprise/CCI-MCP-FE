import { Input, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { X } from "lucide-react";
import React, { useState } from "react";

interface SearchableSelectProps {
  options: {
    id: string;
    value: string;
  }[];
  selectedKeys: Array<{
    id: string;
    value: string;
  }>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedKeys: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        value: string;
      }>
    >
  >;
  type: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  selectedKeys,
  setSelectedKeys,
  options,
  searchQuery,
  setSearchQuery,
  type,
}) => {
  const [open, setOpen] = useState(false);

  // Get all selected options, including those that might be filtered out
  // const getDisplayOptions = () => {
  //     // Get currently visible options
  //     const visibleOptions = options;

  //     // Get selected options that might not be in visible options
  //     const selectedButNotVisible = selectedKeys
  //         .filter(id => !visibleOptions.some(op => op.id === id))
  //         .map(id => ({
  //             id,
  //             value: `(Selected) ${id}` // Fallback display for non-visible selected items
  //         }));

  //     // Combine visible options with selected-but-not-visible options
  //     return [...visibleOptions, ...selectedButNotVisible];
  // }

  const handleRemove = (value: string) => {
    if (selectedKeys.some((item) => item.id === value)) {
      const newSelectedKeys = selectedKeys.filter((item) => item.id !== value);

      setSelectedKeys(newSelectedKeys);
    }
  };

  const handleClick = (opn: any) => {
    let _options = [...selectedKeys];

    if (_options.some((o) => o.id === opn.id)) {
      _options.splice(_options.indexOf(opn.id), 1);
    } else {
      _options.push(opn);
    }
    setSelectedKeys(_options);
  };

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <div className="flex flex-wrap items-center gap-2 bg-zinc-200/50 px-2 py-4 rounded-lg">
          {selectedKeys.length === 0
            ? `Select ${type}`
            : selectedKeys.map((value, index) => (
                <div
                  key={index}
                  className="bg-zinc-400/50 flex gap-2 items-center px-2 py-1 rounded-lg"
                >
                  {value.value}{" "}
                  <X
                    className="cursor-pointer"
                    size={14}
                    onClick={() => handleRemove(value.id)}
                  />{" "}
                  {/* Fallback to id if value not found */}
                </div>
              ))}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="py-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onValueChange={(value) => setSearchQuery(value)}
          />
          <div className="space-y-1 pt-3">
            {options.map((opn: any) => (
              <button
                key={opn.id}
                className={`${selectedKeys.some((selected) => selected.id === opn.id) ? "text-zinc-500 bg-transparent cursor-not-allowed" : ""}  hover:bg-zinc-500/20 cursor-pointer py-2 px-2 rounded-lg`}
                onClick={() => {
                  handleClick(opn);
                }}
              >
                {selectedKeys.some((selected) => selected.id === opn.id) && (
                  <span className="text-green-500 text-sm">✓ </span>
                )}
                {opn.value}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
