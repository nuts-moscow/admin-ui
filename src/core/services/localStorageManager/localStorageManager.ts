import { Dictionary } from '@/core/types/types';
import { makeRandomKey } from '@/core/utils/misc/makeRandomKey';

interface CallbackData<T> {
  readonly callback: (value: T) => void;
  readonly disableSelf: boolean;
}

const stringifyBigIntReviewer = (_: any, value: any) =>
  typeof value === 'bigint'
    ? { value: value.toString(), _bigint: true }
    : value;

const stringifyBigIntReplacer = (_: any, value: any) =>
  !!value?._bigint ? BigInt(value.value) : value;

const mapKeyToCallbackData = new Map<string, Dictionary<CallbackData<any>>>();

setTimeout(() => {
  if (typeof window === 'undefined') {
    return;
  }
  window.addEventListener('storage', ({ key, newValue }) => {
    if (!key) {
      return;
    }

    const callbackData = mapKeyToCallbackData.get(key);
    if (!callbackData) {
      return;
    }

    if (newValue === undefined || newValue === null) {
      return Object.values(callbackData).forEach((cbData) =>
        cbData.callback(undefined),
      );
    }
    return Object.values(callbackData).forEach((cbData) =>
      cbData.callback(JSON.parse(newValue, stringifyBigIntReplacer) as any),
    );
  });
});

const set = <T>(key: string, value: T | undefined): void => {
  if (typeof window === 'undefined') {
    return;
  }
  if (value === undefined || value === null) {
    localStorage.removeItem(key);
  } else {
    const newValue = JSON.stringify(value, stringifyBigIntReviewer);
    localStorage.setItem(key, newValue);
  }

  const callbackData = mapKeyToCallbackData.get(key);
  if (!callbackData) {
    return;
  }
  Object.values(callbackData).forEach((cbData) => {
    if (!cbData.disableSelf) {
      cbData.callback(value);
    }
  });
};

const get = <T>(key: string): T | undefined | null => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const rawValue = localStorage.getItem(key);

  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  return JSON.parse(rawValue, stringifyBigIntReplacer) as any;
};

const getStrict = <T>(key: string): T | undefined | null => {
  if (typeof window === 'undefined') {
    return;
  }

  const rawValue = localStorage.getItem(key);

  try {
    return JSON.parse(rawValue as any, stringifyBigIntReplacer) as any;
  } finally {
  }
};

const subscribeToKey = <T>(
  key: string,
  callback: (value: T | null | undefined) => void,
  disableSelf = false,
): (() => void) => {
  if (!mapKeyToCallbackData.has(key)) {
    mapKeyToCallbackData.set(key, {});
  }

  const cbKey = makeRandomKey(12);
  mapKeyToCallbackData.set(key, {
    ...mapKeyToCallbackData.get(key),
    [cbKey]: { callback, disableSelf },
  });
  callback(get(key));

  return () => {
    delete mapKeyToCallbackData.get(key)![cbKey];
  };
};

const remove = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(key);

  const callbackData = mapKeyToCallbackData.get(key);
  if (!callbackData) {
    return;
  }
  Object.values(callbackData).forEach((cbData) => {
    if (!cbData.disableSelf) {
      cbData.callback(null);
    }
  });
};

const clear = (): void => localStorage.clear();

export const localStorageManager = {
  set,
  get,
  getStrict,
  subscribeToKey,
  remove,
  clear,
};

