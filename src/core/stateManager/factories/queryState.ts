import { useEffect, useState } from 'react';

import { Observer } from '../store';
import { AsyncData } from '../types/Data';
import {
  Dependency,
  DependencyInfer,
  DependencyObject,
} from '../types/Dependency';
import { queryManager } from '../utils/QueryManager';
import { Dictionary } from '@/core/types/types';
import { ShiftTuple } from '@/core/utils/types/ShiftTuple';
import { makeRandomKey } from '@/core/utils/misc/makeRandomKey';
import equal from 'fast-deep-equal/es6';

type PromiseInfer<T> = T extends Promise<infer U> ? U : T;
export interface QueryStateParams<
  F extends (...args: any[]) => any,
  Deps extends Dictionary<Dependency<any>> | undefined,
> {
  readonly request: F;
  readonly pollInterval?: number;
  readonly deps?: Deps;
  readonly cache?: boolean;
  readonly effects?: ((
    currentValue: AsyncData<PromiseInfer<ReturnType<F>>>,
  ) => void)[];
}

export type QueryStateResult<ARGS extends any[], R> = ((...args: ARGS) => R & {
  refetch: (...args: ARGS) => void;
  firstRequest?: boolean;
}) &
  DependencyObject<R>;

export function queryState<
  F extends (
    deps: DepsDictionary extends Dictionary<Dependency<any>>
      ? { [key in keyof DepsDictionary]: DependencyInfer<DepsDictionary[key]> }
      : DepsDictionary,
    currentValue: any,
    changes: DepsDictionary extends Dictionary<Dependency<any>>
      ? Partial<{
          [key in keyof DepsDictionary]: DependencyInfer<DepsDictionary[key]>;
        }>
      : DepsDictionary,
    ...args: any[]
  ) => any,
  DepsDictionary extends Dictionary<Dependency<any>>,
>(
  params: QueryStateParams<F, DepsDictionary>,
): QueryStateResult<
  ShiftTuple<ShiftTuple<ShiftTuple<Parameters<F>>>>,
  AsyncData<PromiseInfer<ReturnType<F>>>
>;

export function queryState({
  cache,
  request,
  pollInterval,
  deps,
  effects,
}: QueryStateParams<
  any,
  Dictionary<Dependency<any>> | undefined
>): QueryStateResult<any, AsyncData<any>> {
  const commonKey = cache ? makeRandomKey(12) : undefined;

  const useHook: QueryStateResult<any, AsyncData<any>> = ((...args: any[]) => {
    const [key] = useState(commonKey || makeRandomKey(12));
    const [data, setData] = useState<AsyncData<any>>(
      queryManager.get(key) || {
        loading: true,
        error: undefined,
        data: undefined,
        firstRequest: true,
      },
    );
    const [cachedArgs, setCachedArgs] = useState(args);

    useEffect(() => {
      const unsubscribe = queryManager.watch(key, {
        observer: (newData: any) => {
          setData(() => {
            if (equal(data, newData)) {
              return data;
            } else {
              return newData;
            }
          });
        },
        effects,
        promiseFactory: request,
        pollInterval: pollInterval,
        args: cachedArgs,
        sensitiveForArgs: cache,
        deps,
      });

      return () => unsubscribe();
    }, [cachedArgs]);

    return {
      ...data,
      refetch: (...args: any[]) => {
        if (equal(args, cachedArgs)) {
          queryManager.refetch(key, args, cache);
        } else {
          setCachedArgs(args);
        }
      },
    };
  }) as QueryStateResult<any, AsyncData<any>>;

  useHook.cached = !!cache;
  useHook.async = true;
  // TODO: Add Arguments support
  useHook.asDependency = (callback: Observer<any>) => {
    const key = commonKey || makeRandomKey(12);

    return queryManager.watch(key, {
      observer: callback,
      args: [],
      effects,
      promiseFactory: request,
      pollInterval: pollInterval,
      sensitiveForArgs: cache,
      deps,
    });
  };

  return useHook;
}
