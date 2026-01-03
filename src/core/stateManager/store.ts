import { Dictionary } from '@/core/types/types';
import equal from 'fast-deep-equal/es6';

export type Observer<T> = (value: T) => void;

export class Store {
  observersByKey: Dictionary<{ value: any; observers: Observer<any>[] }> = {};

  set<T>(key: string, value: T): void {
    const prevValue = this.observersByKey[key]?.value;
    if (!this.observersByKey[key]) {
      this.observersByKey[key] = { value, observers: [] };
    } else {
      this.observersByKey[key] = { ...this.observersByKey[key], value };
    }
    if (!equal(prevValue, value)) {
      this.observersByKey[key].observers.forEach((observer) => observer(value));
    }
  }

  get<T>(key: string): T {
    return this.observersByKey[key]?.value;
  }

  watch<T>(key: string, observer: Observer<T>): () => void {
    if (!this.observersByKey[key]) {
      this.observersByKey[key] = { value: undefined, observers: [observer] };
    } else {
      this.observersByKey[key] = {
        ...this.observersByKey[key],
        observers: this.observersByKey[key].observers.concat(observer),
      };
    }
    observer(this.observersByKey[key].value);

    return () => {
      this.observersByKey[key] = {
        ...this.observersByKey[key],
        observers: this.observersByKey[key].observers.filter(
          (o) => o !== observer,
        ),
      };
    };
  }
}

export const store = new Store();
