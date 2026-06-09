import { X } from "lucide-react";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const handleRemove = (value: string) => {
    if (selectedKeys.some((item) => item.id === value)) {
      const newSelectedKeys = selectedKeys.filter((item) => item.id !== value);

      setSelectedKeys(newSelectedKeys);
    }
  };

  const handleClick = (opn: any) => {
    let _options = [...selectedKeys];

    if (_options.some((o) => o.id === opn.id)) {
      _options = _options.filter((o) => o.id !== opn.id);
    } else {
      _options.push(opn);
    }
    setSelectedKeys(_options);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-wrap items-center gap-2 bg-zinc-200/50 px-2 py-4 rounded-lg cursor-pointer">
          {selectedKeys.length === 0
            ? `Select ${type}`
            : selectedKeys.map((value, index) => (
                <div
                  key={index}
                  className="bg-zinc-400/50 flex gap-2 items-center px-2 py-1 rounded-lg"
                >
                  {value.value}
                  <X
                    className="cursor-pointer"
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value.id);
                    }}
                  />
                </div>
              ))}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="py-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-1 pt-3">
            {options.map((opn: any) => (
              <button
                key={opn.id}
                type="button"
                className={`${selectedKeys.some((selected) => selected.id === opn.id) ? "text-zinc-500" : ""} hover:bg-zinc-500/20 cursor-pointer py-2 px-2 rounded-lg w-full text-left`}
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
