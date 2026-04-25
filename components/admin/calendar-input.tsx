import * as React from "react";
import { format, isValid } from "date-fns";

import { DateField } from "@/components/ui/date-picker";

interface Props {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const CalendarInput: React.FC<Props> = ({ date, setDate }) => {
  const value = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <DateField
      label="Date Of Birth"
      value={value}
      onChange={(v) => {
        if (!v) {
          setDate(undefined);

          return;
        }
        const parsed = new Date(v);

        if (isValid(parsed)) setDate(parsed);
      }}
    />
  );
};

export default CalendarInput;
