export const daysBetween = (startDate, endDate) => {
  const msperDay = 1000 * 60 * 60 * 24; // calculate the total number of miliseconds in a day
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / msperDay) + 1;
};

export const round2 = (value) => {
  return Math.round(value * 100) / 100;
};
