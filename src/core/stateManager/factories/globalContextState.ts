import { Context, useContext } from 'react';
import { Dependency } from '@/core/stateManager/types/Dependency';
import { Observer, store } from '@/core/stateManager/store';
import { Data } from '@/core/stateManager/types/Data';

export const toSetValueFnKey = (name: string) => `${name}_change`;

export const globalContextState = <T>(
  name: string,
  context: Context<T>,
): Dependency<Data<T>> & (() => T) & { snapshot: T } => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hook: Dependency<Data<T>> & (() => T) = () => useContext(context);

  hook.cached = true;
  hook.async = false;
  hook.asDependency = (callback: Observer<any>) => {
    return store.watch(name, (value) => {
      callback({ data: value });
    });
  };
  Object.defineProperty(hook, 'setData', {
    get(): T {
      return store.get(toSetValueFnKey(name));
    },
  });
  Object.defineProperty(hook, 'snapshot', {
    get(): T {
      return store.get(name);
    },
  });
  return hook as any;
};
