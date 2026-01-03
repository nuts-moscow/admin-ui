import { AsyncData, Data, SyncOrAsyncDataInfer } from './Data';

export type DependencyFunction<T> = ((
  callback: (value: T) => void,
) => () => void) & { async: boolean; cached: boolean };

export interface DependencyObject<T> {
  asDependency: (callback: (value: T) => void) => () => void;
  async: boolean;
  cached: boolean;
}

export type Dependency<T extends AsyncData<any> | Data<any>> =
  | DependencyFunction<T>
  | DependencyObject<T>;

export type DependencyInfer<T extends Dependency<any>> = T extends Dependency<
  infer U
>
  ? SyncOrAsyncDataInfer<U>
  : T;

export const isDependencyObject = <T extends Data<any> | AsyncData<any>>(
  value: Dependency<T>,
): value is DependencyObject<T> => {
  return !!(value as any).asDependency;
};
