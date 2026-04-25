import * as React from "react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const CalendarInput: React.FC<Props> = ({ date, setDate }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="calendar-input-dob">Date Of Birth</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            id="calendar-input-dob"
            readOnly
            className="w-full cursor-pointer text-left"
            type="text"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            placeholder="Select a date"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CalendarInput;
