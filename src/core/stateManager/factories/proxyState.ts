import { useEffect, useState } from 'react';

import { ShiftTuple } from '../../utils/types/ShiftTuple';
import { Observer } from '../store';
import { AsyncData, Data, isAsyncData } from '../types/Data';
import {
  Dependency,
  DependencyInfer,
  DependencyObject,
} from '../types/Dependency';
import {
  createHookInstanceController,
  HookInstanceControllerParams,
} from '../utils/HookInstanceController';
import { extractDictionaryData } from '../utils/normalizeDepsData';
import { Dictionary } from '@/core/types/types';
import { makeRandomKey } from '@/core/utils/misc/makeRandomKey';
import equal from 'fast-deep-equal/es6';

const isSomeDataHasError = (
  depsResult: Dictionary<Data<any> | AsyncData<any>>,
): boolean => {
  return Object.values(depsResult).some((value) => {
    if (isAsyncData(value)) {
      return !!value.error;
    }
    return false;
  });
};

const getFirstDataError = (
  depsResult: Dictionary<Data<any> | AsyncData<any>>,
): Error | undefined => {
  const depsArray = Object.values(depsResult);

  for (let i = 0; i < depsArray.length; i++) {
    const value = depsArray[i];
    if (isAsyncData(value) && value.error) {
      return value.error;
    }
  }
  return undefined;
};

const isSomeDataLoading = (
  depsResult: Dictionary<Data<any> | AsyncData<any>>,
): boolean => {
  return Object.values(depsResult).some((value) => {
    if (isAsyncData(value)) {
      return value.loading;
    }
    return false;
  });
};

const replaceDataLoadingState = (
  deps: Dictionary<Data<any> | AsyncData<any>>,
  prevDeps: Dictionary<Data<any> | AsyncData<any>>,
): Dictionary<Data<any> | AsyncData<any>> => {
  const newDeps = { ...deps };
  Object.entries(deps).forEach(([key, value]) => {
    if (!isAsyncData(value)) {
      return;
    }
    if (value.loading) {
      newDeps[key] = prevDeps[key];
    }
  });

  return newDeps;
};

const removeLoadingChanges = (
  changes: Dictionary<Data<any> | AsyncData<any>>,
): Dictionary<Data<any> | AsyncData<any>> => {
  const newChanges = { ...changes };
  Object.entries(changes).forEach(([key, value]) => {
    if (!isAsyncData(value)) {
      return;
    }
    if (value.loading) {
      delete newChanges[key];
    }
  });

  return newChanges;
};

const isDataFirstLoading = (
  depsSchema: Dictionary<Dependency<any>>,
  depsResult: Dictionary<Data<any> | AsyncData<any>>,
): boolean => {
  const filteredDepsResult = Object.entries(depsResult)
    .filter(([, value]) => {
      if (isAsyncData(value)) {
        return !value.loading || !!value.data;
      }
      return true;
    })
    .map(([key]) => key);

  return Object.keys(depsSchema).some(
    (key) => !filteredDepsResult.includes(key),
  );
};

const hasAsyncDeps = (depsSchema: Dictionary<Dependency<any>>): boolean =>
  Object.values(depsSchema).some((d) => d.async);

const hasUncachedDeps = (depsSchema: Dictionary<Dependency<any>>): boolean =>
  Object.values(depsSchema).some((d) => !d.cached);

const getInitialState = (
  depsSchema: Dictionary<Dependency<any>>,
  getData: (...args: any[]) => any,
  args: any[],
): Data<any> | AsyncData<any> => {
  const depsArray = Object.values(depsSchema);

  if (depsArray.some((d) => d.async)) {
    return { data: undefined, error: undefined, loading: true };
  }
  if (depsArray.every((d) => 'data' in d)) {
    const depsResult = Object.entries(depsSchema).reduce(
      (acc, [key, value]) => {
        return { ...acc, [key]: (value as any).data };
      },
      {},
    );
    return {
      data: getData(depsResult, {}, {}, ...args),
      sync: true,
    };
  }
  return { data: undefined, sync: true };
};

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

const createDependencyObserver = (
  callback: (data: Partial<AsyncData<any> | Data<any>>) => void,
  deps: Dictionary<Dependency<any>>,
  getData: (...args: any[]) => any,
  args: any[],
): HookInstanceControllerParams['onDependencyDataChange'] & {
  addCallback: (
    cb: (data: Partial<AsyncData<any> | Data<any>>) => void,
  ) => void;
  removeCallback: (
    cb: (data: Partial<AsyncData<any> | Data<any>>) => void,
  ) => void;
  getCallbackCount: () => number;
  getLastData: () => AsyncData<any> | Data<any> | undefined;
} => {
  let callbacks = [callback];
  let lastData: any = undefined;
  let lastFullData: AsyncData<any> | Data<any> | undefined = undefined;

  const observer: HookInstanceControllerParams['onDependencyDataChange'] & {
    addCallback: (
      cb: (data: Partial<AsyncData<any> | Data<any>>) => void,
    ) => void;
    removeCallback: (
      cb: (data: Partial<AsyncData<any> | Data<any>>) => void,
    ) => void;
    getCallbackCount: () => number;
    getLastData: () => AsyncData<any> | Data<any> | undefined;
  } = (depsResult = {}, changes = {}, prevDepsResult = {}) => {
    if (isDataFirstLoading(deps, depsResult)) {
      callback(getInitialState(deps, getData, args));
    } else if (isSomeDataHasError(depsResult)) {
      callback({ error: getFirstDataError(depsResult) });
    } else if (isSomeDataLoading(depsResult)) {
      try {
        const newDepsResult = replaceDataLoadingState(
          depsResult,
          prevDepsResult,
        );
        if (isDepsDataEquals(newDepsResult, prevDepsResult) && lastData) {
          lastFullData = {
            loading: true,
            error: undefined,
            data: lastData,
          };
          callbacks.forEach((cb) => cb(lastFullData!));
          return;
        }
        lastData = getData(
          extractDictionaryData(newDepsResult),
          extractDictionaryData(removeLoadingChanges(changes)),
          extractDictionaryData(prevDepsResult),
          ...args,
        );
        lastFullData = {
          loading: true,
          error: undefined,
          data: lastData,
        };

        callbacks.forEach((cb) => cb(lastFullData!));
      } catch (e: any) {
        lastFullData = {
          loading: true,
          error: e,
          data: undefined,
        };
        callbacks.forEach((cb) => cb(lastFullData!));
      }
    } else {
      try {
        if (isDepsDataEquals(depsResult, prevDepsResult) && lastData) {
          lastFullData = {
            loading: false,
            error: undefined,
            data: lastData,
          };
          callbacks.forEach((cb) => cb(lastFullData!));
          return;
        }
        lastData = getData(
          extractDictionaryData(depsResult),
          extractDictionaryData(changes),
          extractDictionaryData(prevDepsResult),
          ...args,
        );
        lastFullData = {
          loading: false,
          error: undefined,
          data: lastData,
        };

        callbacks.forEach((cb) => cb(lastFullData!));
      } catch (e: any) {
        lastFullData = {
          loading: false,
          error: e,
          data: undefined,
        };
        callbacks.forEach((cb) => cb(lastFullData!));
      }
    }
  };
  observer.addCallback = (cbToAdd: any) => {
    callbacks = callbacks.concat([cbToAdd]);
  };
  observer.removeCallback = (cbToRemove: any) => {
    callbacks = callbacks.filter((cb) => cb !== cbToRemove);
  };
  observer.getCallbackCount = () => callbacks.length;
  observer.getLastData = () => lastFullData;

  return observer;
};

export interface ProxyStateParams<
  F extends (...args: any[]) => any,
  Deps extends Dictionary<Dependency<any>>,
> {
  readonly deps: Deps;
  readonly getData: F;
  readonly effects?: ((currentValue: Data<ReturnType<F>>) => void)[];
}

export type ProxyStateResult<
  Args extends any[],
  D extends Data<any> | AsyncData<any>,
> = ((...Args: Args) => D & {
  readonly update: (...args: Args) => void;
}) &
  DependencyObject<D>;

export function proxyState<
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
  params: ProxyStateParams<F, DepsDictionary>,
): ProxyStateResult<
  ShiftTuple<ShiftTuple<ShiftTuple<Parameters<F>>>>,
  DepsDictionary extends Dictionary<Dependency<Data<any>>>
    ? Data<ReturnType<F>>
    : AsyncData<ReturnType<F>>
>;

export function proxyState({
  getData,
  deps,
}: ProxyStateParams<any, Dictionary<Dependency<any>>>): ProxyStateResult<
  any,
  any
> {
  const prevArgs: {
    deps: any;
    changes: any;
    prevDeps: any;
  } = {
    deps: undefined,
    changes: undefined,
    prevDeps: undefined,
  };

  const doCache: Dictionary<ReturnType<typeof createDependencyObserver>> = {};
  let observers: HookInstanceControllerParams['onDependencyDataChange'][] = [];
  const hookInstanceController = createHookInstanceController({
    onDependencyDataChange: (deps, changes, prevDeps) => {
      prevArgs.deps = deps;
      prevArgs.changes = changes;
      prevArgs.prevDeps = prevDeps;
      observers.forEach((o) => o && o(deps, changes, prevDeps));
    },
    deps,
  });
  const cached = !hasUncachedDeps(deps);
  const keyRoot = cached ? makeRandomKey(10) : undefined;

  const addObserver = (
    observer: HookInstanceControllerParams['onDependencyDataChange'],
  ) => {
    observers = observers.concat([observer]);
    hookInstanceController.addInstance();

    if (prevArgs.deps && prevArgs.changes) {
      observer!(prevArgs.deps, prevArgs.changes, prevArgs.prevDeps);
    }
  };

  const removeObserver = (
    observer: HookInstanceControllerParams['onDependencyDataChange'],
  ) => {
    observers = observers.filter((o) => o !== observer);
    hookInstanceController.removeInstance();
  };

  const useHook: ProxyStateResult<any, any> = ((...args: any[]) => {
    const [data, setData] = useState<AsyncData<any> | Data<any>>(
      keyRoot && doCache[`${keyRoot}-${args?.join('-')}`]?.getLastData()
        ? (doCache[`${keyRoot}-${args?.join('-')}`].getLastData() as any)
        : getInitialState(deps, getData, args),
    );
    const [cachedArgs, setCachedArgs] = useState(args);

    useEffect(() => {
      const key = keyRoot ? `${keyRoot}-${args?.join('-')}` : undefined;

      const callback = (stateParts: Partial<AsyncData<any> | Data<any>>) => {
        setData((prevState) => {
          const newState = {
            ...prevState,
            ...stateParts,
            data:
              !('data' in stateParts) || equal(stateParts.data, prevState.data)
                ? prevState.data
                : stateParts.data,
          };

          return equal(prevState, newState) ? prevState : newState;
        });
      };

      let observer: ReturnType<typeof createDependencyObserver>;

      if (key && doCache[key]) {
        doCache[key].addCallback(callback);
        observer = doCache[key];
      } else {
        observer = createDependencyObserver(
          callback,
          deps,
          getData,
          cachedArgs,
        );
        addObserver(observer);
        if (key) {
          doCache[key] = observer;
        }
      }

      return () => {
        if (key) {
          observer.removeCallback(callback);
          if (!observer.getCallbackCount()) {
            doCache[key] = undefined as any;
            removeObserver(observer);
          }
        } else {
          removeObserver(observer);
        }
      };
    }, [cachedArgs]);

    return {
      ...data,
      update: (...args: any[]) => {
        setCachedArgs((prevCachedArgs) => {
          if (equal(prevCachedArgs, args)) {
            return prevCachedArgs;
          }
          return args;
        });
      },
    };
  }) as ProxyStateResult<any, any>;

  useHook.asDependency = (callback: Observer<any>) => {
    const key = keyRoot ? `${keyRoot}-${[].join('-')}` : undefined;
    let state: Data<any> | AsyncData<any> =
      key && doCache[key]?.getLastData()
        ? (doCache[key].getLastData() as any)
        : getInitialState(deps, getData, []);
    let observer: ReturnType<typeof createDependencyObserver>;

    const wrappedCb = (stateParts: Partial<AsyncData<any> | Data<any>>) => {
      const newState = {
        ...state,
        ...stateParts,
        data:
          !('data' in stateParts) || equal(stateParts.data, state.data)
            ? state.data
            : stateParts.data,
      };

      if (equal(newState, state)) {
        return;
      }
      state = newState;

      callback(state);
    };

    if (key && doCache[key]) {
      doCache[key].addCallback(wrappedCb);
      observer = doCache[key];
    } else {
      observer = createDependencyObserver(wrappedCb, deps, getData, []);
      addObserver(observer);
      if (key) {
        doCache[key] = observer;
      }
    }
    callback(state);

    return () => {
      if (key) {
        observer.removeCallback(wrappedCb);
        if (!observer.getCallbackCount()) {
          doCache[key] = undefined as any;
          removeObserver(observer);
        }
      } else {
        removeObserver(observer);
      }
    };
  };
  useHook.async = hasAsyncDeps(deps);
  useHook.cached = cached;

  if (!useHook.async) {
    Object.defineProperty(useHook, 'data', {
      get(): any {
        return getInitialState(deps, getData, []).data;
      },
    });
  }

  return useHook;
}
