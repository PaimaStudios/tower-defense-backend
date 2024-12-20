/**
 * Get the UTC ISO-8601 year and week number of a given datetime.
 * @param input The datetime to get the year and week of.
 * @returns A string like `2024w50`.
 */
export function iso8601YearAndWeek(input: Date): {
  str: `${number}w${number}`;
  year: number;
  week: number;
  start: Date;
  end: Date;
} {
  // From https://stackoverflow.com/a/14127528, itself based on jQuery-UI
  // Find Thursday of this week starting on Monday
  const date = new Date(input.getTime());
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const thursday = date.getTime();

  // Find January 1st
  date.setUTCMonth(0); // January
  date.setUTCDate(1); // 1st
  const jan1st = date.getTime();
  const year = date.getUTCFullYear();

  // Round the amount of days to compensate for daylight saving time
  const days = Math.round((thursday - jan1st) / (24 * 60 * 60 * 1000)); // 1 day = 86400000 ms
  const week = Math.floor(days / 7) + 1;

  const start = getDateOfIsoWeek(year, week);
  const end = getDateOfIsoWeek(year, week + 1);

  return { str: `${year}w${week}`, year, week, start, end };
}

// https://stackoverflow.com/a/16591175
/**
 * Get the date from an ISO 8601 week and year
 *
 * https://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {number} year ISO year
 * @param {number} week ISO 8601 week number
 */
function getDateOfIsoWeek(year: number, week: number) {
  if (week < 1 || week > 53) {
    throw new RangeError('ISO 8601 weeks are numbered from 1 to 53, got: ' + year + 'w' + week);
  } else if (!Number.isInteger(week)) {
    throw new TypeError('Week must be an integer, got: ' + year + 'w' + week);
  } else if (!Number.isInteger(year)) {
    throw new TypeError('Year must be an integer, got: ' + year + 'w' + week);
  }

  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay();
  const isoWeekStart = simple;

  // Get the Monday past, and add a week if the day was
  // Friday, Saturday or Sunday.

  isoWeekStart.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
  if (dayOfWeek > 4) {
    isoWeekStart.setUTCDate(isoWeekStart.getUTCDate() + 7);
  }

  // The latest possible ISO week starts on December 28 of the current year.
  /*
  if (
    isoWeekStart.getUTCFullYear() > year ||
    (isoWeekStart.getUTCFullYear() == year &&
      isoWeekStart.getUTCMonth() == 11 &&
      isoWeekStart.getUTCDate() > 28)
  ) {
    throw new RangeError(`${year} has no ISO week ${week}`);
  }
  */

  return isoWeekStart;
}
