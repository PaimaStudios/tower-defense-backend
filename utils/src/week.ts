/**
 * Get the UTC ISO-8601 year and week number of a given datetime.
 * @param date The datetime to get the year and week of.
 * @returns A string like `2024w50`.
 */
export function iso8601YearAndWeek(date: Date): `${number}w${number}` {
  // From https://stackoverflow.com/a/14127528, itself based on jQuery-UI
  // Find Thursday of this week starting on Monday
  date.setDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const thursday = date.getTime();

  // Find January 1st
  date.setMonth(0); // January
  date.setDate(1);  // 1st
  const jan1st = date.getTime();
  const year = date.getUTCFullYear();

  // Round the amount of days to compensate for daylight saving time
  const days = Math.round((thursday - jan1st) / (24 * 60 * 60 * 1000)); // 1 day = 86400000 ms
  const week = Math.floor(days / 7) + 1;

  return `${year}w${week}`;
}
