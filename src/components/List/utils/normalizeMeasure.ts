export const normalizeMeasure = (
  px: number | string | undefined,
): string | undefined => (typeof px === 'number' ? `${px}px` : px);
