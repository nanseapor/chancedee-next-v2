/**
 * Converts a local time (UTC+7) to UTC time (UTC+0) for database storage
 *
 * @param date - The base date object
 * @param timeString - Time string in "HH:mm" format in UTC+7
 * @returns Date object in UTC+0 timezone
 */
export function convertLocalToUTC(date: Date, timeString: string): Date {
  // Create a new date object to avoid mutating the original
  const localDate = new Date(date);

  // Parse the time string
  const [hours, minutes] = timeString.split(":").map(Number);

  // Set the time in local timezone (UTC+7)
  localDate.setHours(hours, minutes, 0, 0);

  // Convert from UTC+7 to UTC+0 by subtracting 7 hours
  const utcDate = new Date(localDate.getTime() - 7 * 60 * 60 * 1000);

  return utcDate;
}

/**
 * Converts a UTC time (UTC+0) from database to local time (UTC+7) for display
 *
 * @param utcDate - The UTC date from database
 * @returns Date object in local timezone (UTC+7)
 */
export function convertUTCToLocal(utcDate: Date): Date {
  // Convert from UTC+0 to UTC+7 by adding 7 hours
  return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
}

/**
 * Formats a date to "HH:mm" time string
 *
 * @param date - The date to format
 * @returns Time string in "HH:mm" format
 */
export function formatTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
