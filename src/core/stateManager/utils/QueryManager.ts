import { Observer } from '../store';
import { AsyncData } from '../types/Data';
import { Dependency } from '../types/Dependency';
import { PromiseFactory } from '../types/PromiseFactory';
import {
  createHookInstanceController,
  HookInstanceController,
} from './HookInstanceController';
import { extractDictionaryData } from './normalizeDepsData';
import { Dictionary } from '@/core/types/types';
import equal from 'fast-deep-equal/es6';
import { logger } from '@/core/services/logger/logger';

const SKIP_EVENT = Symbol('SKIP_EVENT');

export const skip = <T>(): T => SKIP_EVENT as any;

const qmLogger = logger('QueryManager');

const customSetInterval = (
  callback: () => void,
  ms: number,
): ReturnType<typeof setInterval> => {
  let alreadyUpdates = false;

  return setInterval(() => {
    // TODO: THINK ABOUT INSTANT UPDATE
    if (document.visibilityState === 'hidden') {
      return;
    }
    if (alreadyUpdates) {
      alreadyUpdates = false;
      return;
    }
    callback();
  }, ms);
};

interface ObserverData<T> {
  value: AsyncData<T>;
  observers: Observer<any>[];
  promiseFactory: PromiseFactory;
  sensitiveForArgs?: boolean;
  hic: HookInstanceController;
  depsResult?: Dictionary<any> | undefined;
  changes?: Dictionary<any> | undefined;
  intervalId: any;
  timerId?: any;
  args: any[];
  rawKey: string;
  effects?: ((currentValue: AsyncData<any>) => void)[];
}

interface WatchParams {
  readonly observer: Observer<any>;
  readonly pollInterval?: number;
  readonly promiseFactory: PromiseFactory;
  readonly args?: any[];
  readonly sensitiveForArgs?: boolean;
  readonly deps?: Dictionary<Dependency<any>>;
  readonly effects?: ((currentValue: AsyncData<any>) => void)[];
}

class QueryManager {
  observersDataByKey: Dictionary<ObserverData<any>> = {};

  get(key: string): AsyncData<any> {
    return this.observersDataByKey[key]?.value;
  }

  watch(
    rawKey: string,
    {
      promiseFactory,
      pollInterval,
      args,
      sensitiveForArgs,
      observer,
      deps,
      effects,
    }: WatchParams,
  ): () => void {
    const key = sensitiveForArgs ? `${rawKey}-${args?.join('-')}` : rawKey;

    const observerData = this.observersDataByKey[key];

    const applyEffects = (asyncData: AsyncData<any>) => {
      const effects = this.observersDataByKey[key].effects;

      if (!effects?.length) {
        return;
      }
      effects.forEach((effect) => effect(asyncData));
    };

    const request = (firstRequest?: boolean) => {
      if (!this.observersDataByKey[key]) {
        return;
      }
      const deps = this.observersDataByKey[key].depsResult;
      const changes = this.observersDataByKey[key].changes;

      this.observersDataByKey[key].value = {
        ...this.observersDataByKey[key].value,
        loading: true,
        // @ts-expect-error-ignore
        firstRequest,
      };

      this.observersDataByKey[key].observers.forEach((o) =>
        o(this.observersDataByKey[key].value),
      );
      applyEffects(this.observersDataByKey[key].value);

      const cachedDepsResult = this.observersDataByKey[key].depsResult;
      this.observersDataByKey[key]
        .promiseFactory(
          deps,
          this.observersDataByKey[key].value.data,
          changes,
          ...this.observersDataByKey[key].args,
        )
        .then((data) => {
          if (
            cachedDepsResult !== this.observersDataByKey[key].depsResult ||
            data === SKIP_EVENT
          ) {
            return;
          }
          this.observersDataByKey[key].value = {
            ...this.observersDataByKey[key]?.value,
            data: equal(this.observersDataByKey[key].value.data, data)
              ? this.observersDataByKey[key].value.data
              : data,
            loading: false,
            error: undefined,
            // @ts-expect-error-ignore
            firstRequest,
          };
          this.observersDataByKey[key].observers.forEach((o) =>
            o(this.observersDataByKey[key].value),
          );
          applyEffects(this.observersDataByKey[key].value);
        })
        .catch((error) => {
          if (cachedDepsResult !== this.observersDataByKey[key]?.depsResult) {
            return;
          }
          this.observersDataByKey[key].value = {
            ...this.observersDataByKey[key]?.value,
            error,
            loading: false,
            // @ts-expect-error-ignore
            firstRequest,
          };
          this.observersDataByKey[key].observers.forEach((o) =>
            o(this.observersDataByKey[key].value),
          );
          applyEffects(this.observersDataByKey[key].value);
        });
    };

    if (!!observerData) {
      observerData.observers = observerData.observers.concat(observer);
      if (!equal(observerData.args, args)) {
        observerData.args = args || [];
        observerData.hic.triggerDataChange();
      } else {
        observer(observerData.value);
      }
      if (observerData?.timerId) {
        qmLogger.log('cancel destroy');
        clearTimeout(observerData.timerId);
        observerData.timerId = undefined;
      } else {
        observerData.hic.addInstance();
      }
    } else {
      const newObserverData: ObserverData<any> = {
        promiseFactory,
        sensitiveForArgs,
        observers: [observer],
        value: { loading: true, error: undefined, data: undefined },
        intervalId: undefined,
        rawKey: rawKey,
        args: args || [],
        effects: effects,
        hic: createHookInstanceController({
          deps,
          asyncDataRules: ['excludeLoading'],
          onDependencyDataChange: (deps, changes, prevDeps) => {
            qmLogger.log('deps changes', prevDeps);
            const newDeps = extractDictionaryData(deps);

            if (
              !!newDeps &&
              !!newObserverData.depsResult &&
              equal(newDeps, newObserverData.depsResult)
            ) {
              return;
            }

            newObserverData.changes = extractDictionaryData(changes);
            newObserverData.depsResult = newDeps;

            clearInterval(newObserverData.intervalId);
            let intervalId: any;
            if (pollInterval) {
              intervalId = customSetInterval(() => request(), pollInterval);
            }
            newObserverData.intervalId = intervalId;

            Promise.resolve().then(() => request(true));
          },
        }),
      };
      if (!Object.keys(deps || {}).length) {
        let intervalId: any;
        if (pollInterval) {
          intervalId = customSetInterval(() => request(), pollInterval);
        }
        Promise.resolve().then(() => request(true));
        newObserverData.intervalId = intervalId;
      }
      newObserverData.hic.addInstance();
      this.observersDataByKey[key] = newObserverData;
    }

    return () => {
      this.observersDataByKey[key].observers = this.observersDataByKey[
        key
      ].observers.filter((o) => o !== observer);

      if (!this.observersDataByKey[key].observers.length) {
        qmLogger.log('waiting for destroy');
        const timerId = setTimeout(() => {
          if (!this.observersDataByKey[key].observers.length) {
            qmLogger.log('destroy');
            this.observersDataByKey[key].hic.removeInstance();
            clearInterval(this.observersDataByKey[key].intervalId);
            delete this.observersDataByKey[key];
          } else {
            qmLogger.log('cancel destroy');
            clearTimeout(timerId);
            this.observersDataByKey[key].timerId = undefined;
          }
        }, 5_000);
        this.observersDataByKey[key].timerId = timerId;
      } else {
        this.observersDataByKey[key].hic.removeInstance();
      }
    };
  }

  refetch(rawKey: string, args?: any[], cache?: boolean): void {
    const key = cache ? `${rawKey}-${args?.join('-')}` : rawKey;

    if (this.observersDataByKey[key]) {
      this.observersDataByKey[key].hic.triggerDataChange();
    }
  }
}

export const queryManager = new QueryManager();
