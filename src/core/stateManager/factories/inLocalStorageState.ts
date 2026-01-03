import { mergeDeepRight } from 'ramda';
import { useEffect, useState } from 'react';

import { localStorageManager } from '../../services/localStorageManager/localStorageManager';

import { Observer, store } from '../store';
import { Data, SyncOrAsyncDataInfer } from '../types/Data';
import {
  Dependency,
  DependencyInfer,
  DependencyObject,
} from '../types/Dependency';
import { createHookInstanceController } from '../utils/HookInstanceController';
import { extractDictionaryData } from '../utils/normalizeDepsData';
import { Dictionary } from '@/core/types/types';

export interface InLocalStorageStateParams<
  T,
  Deps extends Dictionary<Dependency<any>> | undefined,
> {
  readonly defaultValue: T;
  readonly key: string;
  readonly deps?: Deps;
  readonly transform?: {
    serialize: (value: T) => any;
    deserialize: (serializedValue: any) => T;
  };
  readonly getData?: (
    deps: Deps extends Dictionary<Dependency<any>>
      ? { [key in keyof Deps]: DependencyInfer<Deps[key]> }
      : Deps,
    currentValue: T,
    changes: Deps extends Dictionary<Dependency<any>>
      ? Partial<{ [key in keyof Deps]: DependencyInfer<Deps[key]> }>
      : Deps,
  ) => T;
  readonly effects?: ((currentValue: Data<T>) => void)[];
}

export type InLocalStorageStateResult<
  R extends boolean | undefined,
  D extends Data<any>,
> = (() => R extends true
  ? D
  : {
      setData: (data: SyncOrAsyncDataInfer<D>) => void;
      patchData: (data: Partial<SyncOrAsyncDataInfer<D>>) => void;
    } & D) & {
  setData: (data: SyncOrAsyncDataInfer<D>) => void;
  data: SyncOrAsyncDataInfer<D>;
  patchData: (data: Partial<SyncOrAsyncDataInfer<D>>) => void;
} & DependencyObject<D>;

export function inLocalStorageState<
  T,
  DepsDictionary extends Dictionary<Dependency<any>> | undefined = undefined,
>(
  params: InLocalStorageStateParams<T, DepsDictionary> & { readonly?: false },
): InLocalStorageStateResult<false, Data<T>>;
export function inLocalStorageState<
  T,
  DepsDictionary extends Dictionary<Dependency<any>> | undefined = undefined,
>(
  params: InLocalStorageStateParams<T, DepsDictionary> & { readonly: true },
): InLocalStorageStateResult<true, Data<T>>;

export function inLocalStorageState({
  defaultValue,
  key,
  transform,
  getData,
  deps,
}: InLocalStorageStateParams<
  any,
  Dictionary<Dependency<any>>
>): InLocalStorageStateResult<boolean, Data<any>> {
  const deserialize = (rawValue: any): any => {
    if (!transform) {
      return rawValue;
    }
    return transform.deserialize(rawValue);
  };

  const serialize = (value: any): any => {
    if (!transform) {
      return value;
    }
    return transform.serialize(value);
  };

  const hookInstanceController = createHookInstanceController({
    onDependencyDataChange: getData
      ? (deps, changes) => {
          localStorageManager.set(
            key,
            serialize(
              getData(
                extractDictionaryData(deps) as any,
                store.get(key),
                extractDictionaryData(changes) as any,
              ),
            ),
          );
        }
      : undefined,
    deps,
    asyncDataRules: ['excludeLoading', 'excludeErrors'],
  });

  const useHook: InLocalStorageStateResult<boolean, Data<any>> = (() => {
    const [data, setData] = useState<any>(
      deserialize(localStorageManager.get(key)),
    );

    const normalizedData = data !== undefined ? data : defaultValue;

    useEffect(() => {
      hookInstanceController.addInstance();
      const unsubscribe = localStorageManager.subscribeToKey<any>(
        key,
        (rawData) => {
          const data = deserialize(rawData);
          const normalizedData = data !== undefined ? data : defaultValue;
          setData(normalizedData);
        },
      );

      return () => {
        unsubscribe();
        hookInstanceController.removeInstance();
      };
    }, []);

    return {
      data: normalizedData,
      setData: (data) => localStorageManager.set(key, serialize(data)),
      patchData: (data) =>
        localStorageManager.set(
          key,
          serialize(mergeDeepRight(normalizedData, data)),
        ),
    };
  }) as InLocalStorageStateResult<boolean, Data<any>>;

  useHook.patchData = (value: any) => {
    localStorageManager.set(
      key,
      serialize(
        mergeDeepRight(
          deserialize(localStorageManager.get(key)) || defaultValue,
          value,
        ),
      ),
    );
  };
  Object.defineProperty(useHook, 'data', {
    get(): any {
      return deserialize(localStorageManager.get(key)) || defaultValue;
    },
  });
  useHook.setData = (value: any) => {
    localStorageManager.set(key, serialize(value) || defaultValue);
  };
  useHook.async = false;
  useHook.cached = true;
  useHook.asDependency = (callback: Observer<any>) => {
    return localStorageManager.subscribeToKey(key, (rawValue) => {
      const data = deserialize(rawValue);
      callback({ data: data !== undefined ? data : defaultValue });
    });
  };

  return useHook;
}
