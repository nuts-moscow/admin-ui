export interface Data<T> {
  readonly sync: true;
  readonly data: T;
}

export interface AsyncData<T> {
  readonly data: T;
  readonly loading: boolean;
  readonly error?: Error;
}

export type SyncOrAsyncDataInfer<T extends Data<any> | AsyncData<any>> =
  T extends AsyncData<infer U> ? U : T extends Data<infer U> ? U : T;

export const isAsyncData = <T = any>(
  data: Data<T> | AsyncData<T>,
): data is AsyncData<T> => (data as any).loading !== undefined;
