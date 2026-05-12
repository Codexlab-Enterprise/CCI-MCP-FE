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

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (/^\d{4}-\d{2}-\d{2}([T\s].*)?$/.test(value)) {
    const d = parseISO(value);

    return isValid(d) ? d : null;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const d = parse(value, DISPLAY_DATE_FORMAT, new Date());

    return isValid(d) ? d : null;
  }
  const d = new Date(value);

  return isValid(d) ? d : null;
};

/**
 * Returns a "X years Y months Z days" string between two dates.
 * `reference` defaults to today.
 */
export function calculateDetailedAge(
  dob: string | Date | null | undefined,
  reference: string | Date | null | undefined = new Date(),
): string {
  const dobDate = toDate(dob);
  const refDate = toDate(reference);

  if (!dobDate || !refDate || refDate < dobDate) return "";

  let years = refDate.getFullYear() - dobDate.getFullYear();
  let months = refDate.getMonth() - dobDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let days = refDate.getDate() - dobDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);

    days += prevMonth.getDate();

    if (months < 0) {
      years--;
      months += 12;
    }
  }

  const parts: string[] = [];

  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  if (days > 0 || parts.length === 0)
    parts.push(`${days} day${days !== 1 ? "s" : ""}`);

  return parts.join(" ");
}
