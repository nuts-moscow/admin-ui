import { uint } from '@/core/types/types';

interface FastAccessListConfig<T extends object, K extends keyof T> {
  readonly capacity: uint;
  readonly start: uint;
  readonly end: uint;
  readonly buffer: (T | null)[];
  readonly key: K;
  readonly length: number;
  readonly map: Map<any, { index: uint; value: T }>;
}

export class FastAccessList<T extends object, K extends keyof T> {
  static merge<T extends object, K extends keyof T>(
    first: FastAccessList<T, K>,
    second: FastAccessList<T, K>,
  ) {
    let firstClone = new FastAccessList<T, K>({
      start: first.start,
      end: first.end,
      map: new Map(first.map.entries()),
      buffer: first.buffer.slice(0),
      capacity: first.capacity,
      key: first.key,
      length: first.length,
    });

    for (let i = 0; i <= second.length - 1; i++) {
      firstClone = firstClone.updateOrAddLast(second.atIndex(i));
    }
    return firstClone;
  }

  static create<T extends object, K extends keyof T>(
    key: K,
  ): FastAccessList<T, K> {
    const capacity = 1000;
    const start = Math.floor(capacity / 2);

    return new FastAccessList<T, K>({
      key,
      capacity,
      start,
      end: start,
      buffer: new Array<T | null>(capacity).fill(null),
      map: new Map(),
      length: 0,
    });
  }

  private buffer: (T | null)[];

  private start: uint;

  private end: uint;

  private capacity: uint;

  private _length: uint;

  private map: Map<any, { index: uint; value: T }>;

  private key: K;

  private constructor(config: FastAccessListConfig<T, K>) {
    this.capacity = config.capacity;
    this.buffer = config.buffer;
    this.start = config.start;
    this.end = config.end;
    this.key = config.key;
    this._length = config.length;
    this.map = config.map;
  }

  private resize() {
    const newCapacity = this.capacity * 2;
    const newBuffer = new Array<T | null>(newCapacity).fill(null);

    const newStart = Math.floor((newCapacity - this._length) / 2);

    for (let i = 0; i < this._length; i++) {
      newBuffer[newStart + i] = this.buffer[this.start + i];
    }

    this.buffer = newBuffer;
    this.capacity = newCapacity;
    this.start = newStart;
    this.end = this.start + this._length;
  }

  update(item: T): FastAccessList<T, K> {
    const itemKey = item[this.key];
    const itemIndex = this.map.get(itemKey)!.index;
    this.map.set(itemKey, {
      index: itemIndex,
      value: item,
    });
    this.buffer[itemIndex] = item;
    return new FastAccessList<T, K>({
      key: this.key,
      start: this.start,
      end: this.end,
      length: this.length,
      buffer: this.buffer,
      map: this.map,
      capacity: this.capacity,
    });
  }

  get length(): number {
    return this._length;
  }

  updateOrAddFirst(item: T): FastAccessList<T, K> {
    const itemKey = item[this.key];

    if (this.map.has(itemKey)) {
      return this.update(item);
    }
    if (this.start === 0) {
      this.resize();
    }
    this.start--;
    this.buffer[this.start] = item;
    this.map.set(itemKey, {
      index: this.start,
      value: item,
    });
    this._length += 1;
    return new FastAccessList<T, K>({
      key: this.key,
      start: this.start,
      end: this.end,
      length: this.length,
      buffer: this.buffer,
      map: this.map,
      capacity: this.capacity,
    });
  }

  updateOrAddLast(item: T): FastAccessList<T, K> {
    const itemKey = item[this.key];

    if (this.map.has(itemKey)) {
      return this.update(item);
    }
    if (this.start === 0) {
      this.resize();
    }
    this.buffer[this.end] = item;
    this.end++;
    this.map.set(itemKey, {
      index: this.start,
      value: item,
    });
    this._length += 1;
    return new FastAccessList<T, K>({
      key: this.key,
      start: this.start,
      end: this.end,
      length: this.length,
      buffer: this.buffer,
      map: this.map,
      capacity: this.capacity,
    });
  }

  atIndex(index: number): T {
    if (index < 0 || index >= this._length) {
      throw new Error('Index out of bounds');
    }
    return this.buffer[this.start + index] as T;
  }

  atKey(key: T[K]): T | undefined {
    return this.map.get(key)?.value;
  }
}

