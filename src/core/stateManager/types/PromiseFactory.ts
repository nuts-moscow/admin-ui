export type PromiseFactory<A extends any[] = any[], R = any> = (
  ...args: A
) => Promise<R>;
