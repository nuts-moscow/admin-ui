export type ShiftTuple<T extends unknown[]> = T extends [T[0], ...infer R]
  ? R
  : T;

