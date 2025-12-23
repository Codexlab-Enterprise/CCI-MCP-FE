import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Calendar, DateValue } from "@heroui/calendar";
import React from "react";
import { Input } from "@heroui/input";

interface Props {
  date: DateValue;
  setDate: (date: DateValue) => void;
}

const CalendarInput: React.FC<Props> = ({ date, setDate }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover isOpen={open} placement="bottom" onOpenChange={setOpen}>
      <PopoverTrigger className="w-full text-left">
        <Input
          readOnly
          className="w-full text-left [&_input]:text-left"
          label="Date Of Birth"
          type="text"
          value={date?.toString() || "Select a date"}
        />
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          showMonthAndYearPickers
          aria-label="Date (Controlled)"
          value={date}
          onChange={(newDate) => {
            setDate(newDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CalendarInput;
