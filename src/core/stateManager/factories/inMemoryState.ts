import { useEffect, useState } from 'react';

import { Observer, store } from '../store';
import { AsyncData, Data, SyncOrAsyncDataInfer } from '../types/Data';
import {
  Dependency,
  DependencyInfer,
  DependencyObject,
} from '../types/Dependency';
import { createHookInstanceController } from '../utils/HookInstanceController';
import { extractDictionaryData } from '../utils/normalizeDepsData';
import { Dictionary } from '@/core/types/types';
import { makeRandomKey } from '@/core/utils/misc/makeRandomKey';
import equal from 'fast-deep-equal/es6';
import mergeDeepRight from 'ramda/es/mergeDeepRight';

const isDepsDataEquals = (
  deps: Dictionary<Data<any> | AsyncData<any>>,
  prevDeps: Dictionary<Data<any> | AsyncData<any>>,
) => {
  const depsData = Object.entries(deps).reduce<Dictionary<any>>(
    (acc, [name, value]) => ({
      ...acc,
      [name]: value.data,
    }),
    {},
  );
  const prevDepsData = Object.entries(prevDeps).reduce<Dictionary<any>>(
    (acc, [name, value]) => ({
      ...acc,
      [name]: value.data,
    }),
    {},
  );

  return equal(depsData, prevDepsData);
};

export interface InMemoryStateParams<
  T,
  Deps extends Dictionary<Dependency<any>> | undefined,
> {
  readonly defaultValue: T;
  readonly updateInterval?: number;
  readonly deps?: Deps;
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

export type InMemoryStateHook<
  R extends boolean | undefined,
  D extends Data<any>,
> = () => R extends true
  ? D
  : {
      setData: (data: SyncOrAsyncDataInfer<D>) => void;
      patchData: (data: Partial<SyncOrAsyncDataInfer<D>>) => void;
    } & D;

export type InMemoryStateResult<
  R extends boolean | undefined,
  D extends Data<any>,
> = InMemoryStateHook<R, D> & {
  setData: (data: SyncOrAsyncDataInfer<D>) => void;
  data: SyncOrAsyncDataInfer<D>;
  patchData: (data: Partial<SyncOrAsyncDataInfer<D>>) => void;
} & DependencyObject<D>;

export function inMemoryState<
  T,
  DepsDictionary extends Dictionary<Dependency<any>> | undefined = undefined,
>(
  params: InMemoryStateParams<T, DepsDictionary> & { readonly?: false },
): InMemoryStateResult<false, Data<T>>;
export function inMemoryState<
  T,
  DepsDictionary extends Dictionary<Dependency<any>> | undefined = undefined,
>(
  params: InMemoryStateParams<T, DepsDictionary> & { readonly: true },
): InMemoryStateResult<true, Data<T>>;

export function inMemoryState({
  defaultValue,
  deps,
  updateInterval,
  getData,
}: InMemoryStateParams<
  any,
  Dictionary<Dependency<any>> | undefined
>): InMemoryStateResult<boolean, Data<any>> {
  const key = makeRandomKey(12);
  store.set(key, defaultValue);

  let intervalId: any = undefined;

  const hookInstanceController = createHookInstanceController({
    onDependencyDataChange: getData
      ? (deps, changes, prevDeps) => {
          if (deps && prevDeps && isDepsDataEquals(deps, prevDeps)) {
            return;
          }

          store.set(
            key,
            getData(
              // TODO: HANDLE ASYNC ERROR
              extractDictionaryData(deps),
              store.get(key),
              extractDictionaryData(changes),
            ),
          );
        }
      : undefined,
    deps,
    asyncDataRules: ['excludeLoading', 'excludeErrors'],
    onStart: () => {
      if (updateInterval) {
        intervalId = setInterval(() => {
          hookInstanceController.triggerDataChange();
        }, updateInterval);
      }
    },
    onStop: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });

  const useHook: InMemoryStateResult<any, any> = (() => {
    const [memoryData, setMemoryData] = useState<any>(
      store.get(key) || defaultValue,
    );

    useEffect(() => {
      hookInstanceController.addInstance();
      const unwatch = store.watch(key, (value) => setMemoryData(value));

      return () => {
        unwatch();
        hookInstanceController.removeInstance();
      };
    }, []);

    return {
      data: memoryData,
      setData: (value: any) => store.set(key, value),
      patchData: (value: any) =>
        store.set(key, mergeDeepRight(memoryData, value)),
    };
  }) as InMemoryStateResult<any, any>;

  useHook.patchData = (value: any) => {
    store.set(key, mergeDeepRight(store.get<any>(key), value));
  };
  useHook.setData = (value: any) => {
    store.set(key, value);
  };
  Object.defineProperty(useHook, 'data', {
    get(): any {
      return store.get(key);
    },
  });
  useHook.async = false;
  useHook.cached = true;
  useHook.asDependency = (callback: Observer<any>) => {
    return store.watch(key, (value) => {
      callback({ data: value });
    });
  };

  return useHook;
}
