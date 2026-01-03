import { AsyncData, Data, isAsyncData } from '../types/Data';
import { Dependency, isDependencyObject } from '../types/Dependency';
import { Dictionary } from '@/core/types/types';

export interface HookInstanceController {
  addInstance(): void;
  removeInstance(): void;
  triggerDataChange(): void;
}

type AsyncDataRules = 'excludeLoading' | 'excludeErrors';

export interface HookInstanceControllerParams {
  readonly onStart?: () => void;
  readonly onStop?: () => void;
  readonly asyncDataRules?: AsyncDataRules[];
  readonly onDependencyDataChange?: (
    deps: Dictionary<Data<any> | AsyncData<any>> | undefined,
    changes: Dictionary<Data<any> | AsyncData<any>> | undefined,
    prevDeps: Dictionary<Data<any> | AsyncData<any>> | undefined,
  ) => void;
  readonly deps: Dictionary<Dependency<any>> | undefined;
}

export const createHookInstanceController = ({
  onStart,
  onStop,
  deps,
  onDependencyDataChange,
  asyncDataRules,
}: HookInstanceControllerParams): HookInstanceController => {
  let startedInstanceCount = 0;
  const depsResult: Dictionary<any> = {};
  const depsSubscriptions: (() => void)[] = [];
  const allDepsKey = Object.keys(deps || {});

  let depsResultChange: Dictionary<any> = {};
  let depsResultTimer: any = undefined;

  const isValidValue = (data: Data<any> | AsyncData<any>): boolean => {
    if (!isAsyncData(data)) {
      return true;
    }
    if (!asyncDataRules?.length) {
      return true;
    }
    if (asyncDataRules.includes('excludeLoading') && data.loading) {
      return false;
    }
    if (asyncDataRules.includes('excludeErrors') && data.error) {
      return false;
    }
    return true;
  };

  const executeDataProducer = (dKey: string, dValue: any) => {
    if (!isValidValue(dValue)) {
      return;
    }
    const prevDepsResult = { ...depsResult };
    depsResult[dKey] = dValue;
    depsResultChange[dKey] = dValue;
    if (allDepsKey.every((dKey) => dKey in depsResult) && !depsResultTimer) {
      depsResultTimer = setTimeout(() => {
        onDependencyDataChange!(depsResult, depsResultChange, prevDepsResult);
        depsResultTimer = undefined;
        depsResultChange = {};
      });
    }
  };

  const runDepsAndIntervalWatch = () => {
    if (!deps || !onDependencyDataChange) {
      return;
    }
    Object.entries(deps).forEach(([key, dep]) => {
      if (isDependencyObject(dep)) {
        depsSubscriptions.push(
          dep.asDependency((value) => executeDataProducer(key, value)),
        );
      } else {
        console.warn('dependency functuin not supported now');
      }
    });
  };

  const triggerDataChange = () => {
    clearTimeout(depsResultTimer);
    depsResultTimer = setTimeout(() => {
      onDependencyDataChange!(
        deps ? depsResult : undefined,
        deps ? depsResultChange : undefined,
        deps ? depsResult : undefined,
      );
      depsResultTimer = undefined;
      depsResultChange = {};
    });
  };

  const stopDepsAndIntervalWatch = () => {
    depsSubscriptions.forEach((dep) => dep());
    depsSubscriptions.splice(0, depsSubscriptions.length);
  };

  const addInstance = () => {
    startedInstanceCount++;
    if (startedInstanceCount === 1) {
      runDepsAndIntervalWatch();
      if (onStart) {
        onStart();
      }
    }
  };

  const removeInstance = () => {
    startedInstanceCount--;
    if (startedInstanceCount === 0) {
      stopDepsAndIntervalWatch();
      if (onStop) {
        onStop();
      }
    }
  };

  return {
    addInstance,
    removeInstance,
    triggerDataChange,
  };
};
