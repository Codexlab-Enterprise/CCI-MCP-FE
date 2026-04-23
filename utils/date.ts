import { format, isValid, parse, parseISO } from "date-fns";

export const DISPLAY_DATE_FORMAT = "dd-MM-yyyy";

export function formatDisplayDate(
  value: string | Date | null | undefined,
  fallback = "--",
) {
  if (!value) return fallback;

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (/^\d{4}-\d{2}-\d{2}([T\s].*)?$/.test(value)) {
    date = parseISO(value);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    date = parse(value, DISPLAY_DATE_FORMAT, new Date());
  } else {
    date = new Date(value);
  }

  return isValid(date) ? format(date, DISPLAY_DATE_FORMAT) : fallback;
}
