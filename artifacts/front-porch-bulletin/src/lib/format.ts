import { format, parseISO } from "date-fns";

export function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "EEEE, MMMM do, yyyy");
  } catch (e) {
    return dateString;
  }
}

export function formatDateline(dateString: string | undefined | null) {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "MMM. d").toUpperCase();
  } catch (e) {
    return dateString;
  }
}
