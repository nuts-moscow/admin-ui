export type GutterTwoNumbers = [number, number];
export type GutterFourNumbers = [number, number, number, number];
export type Gutter = number | GutterTwoNumbers | GutterFourNumbers;

export const calcGutter = (n: number): string =>
  `calc(var(--base-gutter) * ${n})`;

export const getGutter = (p: Gutter): string => {
  if (p instanceof Array && p.length === 2) {
    return `${calcGutter(p[0])} ${calcGutter(p[1])}`;
  }
  if (p instanceof Array && p.length === 4) {
    return `${calcGutter(p[0])} ${calcGutter(p[1])} ${calcGutter(
      p[2],
    )} ${calcGutter(p[3])}`;
  }
  return `calc(var(--base-gutter) * ${p})`;
};

export const normalizeGutter = (p: Gutter): GutterFourNumbers => {
  if (p instanceof Array && p.length === 2) {
    return [p[0], p[1], p[0], p[1]];
  }
  if (p instanceof Array && p.length === 4) {
    return [p[0], p[1], p[2], p[3]];
  }
  return [p, p, p, p];
};
