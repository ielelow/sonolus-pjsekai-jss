export const note = {
  h: 75 / 850 / 2,
};
export const approach = (fromTime, toTime, now) =>
  1.06 ** (45 * Math.remap(fromTime, toTime, -1, 0, now));
