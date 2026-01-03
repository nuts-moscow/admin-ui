import { AsyncData, Data, isAsyncData } from '../types/Data';
import { Dictionary } from '@/core/types/types';

type SyncOrAsyncDataDictionary = Dictionary<Data<any> | AsyncData<any>>;

export const normalizeDepsData = (
  deps: SyncOrAsyncDataDictionary | undefined,
  changes: SyncOrAsyncDataDictionary | undefined,
  prevDeps: SyncOrAsyncDataDictionary | undefined,
): {
  deps: SyncOrAsyncDataDictionary | undefined;
  changes: SyncOrAsyncDataDictionary | undefined;
} => {
  if (!changes) {
    return { deps, changes };
  }
  if (!Object.keys(changes).length) {
    return { deps, changes };
  }

  const newChanges = { ...changes };
  const newDeps = { ...deps };
  Object.entries(newChanges).forEach(([key, value]) => {
    if (!isAsyncData(value)) {
      return;
    }
    if (!value.loading && !value.error) {
      return;
    }
    delete newChanges[key];
    if (
      !prevDeps ||
      !prevDeps[key] ||
      (prevDeps[key] as AsyncData<any>).loading
    ) {
      delete newDeps[key];
    } else {
      newDeps[key] = prevDeps[key];
    }
  });

  const normalizedNewDeps = Object.entries(newDeps).reduce(
    (acc, [key, value]) => {
      acc[key] = value.data;
      return acc;
    },
    {} as any,
  );

  return { deps: normalizedNewDeps, changes: newChanges };
};

export const extractDictionaryData = (
  src: SyncOrAsyncDataDictionary | undefined,
): Dictionary<any> | undefined => {
  if (!src) {
    return src;
  }
  return Object.entries(src).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.data,
    }),
    {},
  );
};
