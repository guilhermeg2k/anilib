export const createDateByDayMonthAndYear = (
  day: number,
  month: number,
  year: number
) => {
  const date = new Date();
  date.setFullYear(year);
  date.setMonth(month);
  date.setDate(day);
  return date;
};
