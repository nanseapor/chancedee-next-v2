/**
 * Converts Firebase Timestamp objects to milliseconds with flexible input handling
 * Handles Firebase Timestamp objects, already-converted numbers, and fallback cases
 * @param dateData - Firebase Timestamp object, number, or other value
 * @param fallbackValue - Value to return if conversion fails (defaults to Date.now())
 * @returns Timestamp in milliseconds
 */
export const formatMeilisearchTimestampToMillis = (
  dateData?: { _seconds: number; _nanoseconds?: number } | number | any,
  fallbackValue?: number,
): number => {
  // Handle Firebase Timestamp objects with _seconds and _nanoseconds
  if (
    typeof dateData === "object" &&
    dateData &&
    typeof dateData._seconds === "number"
  ) {
    return (
      dateData._seconds * 1000 +
      Math.floor((dateData._nanoseconds || 0) / 1000000)
    );
  }

  // Handle already converted numbers
  if (typeof dateData === "number") {
    return dateData;
  }

  // Fallback for undefined/null or invalid values
  return fallbackValue || Date.now();
};
