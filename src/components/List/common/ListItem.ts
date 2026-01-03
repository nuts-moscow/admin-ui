import { ReactNode } from 'react';
import { uint } from '@/core/types/types';

export interface ListItem<T> {
  readonly item: T;
  readonly index: uint;
  readonly height: number;
  readonly itemHeight: number;
  readonly expandHeight: number;
  readonly expanded: boolean;
  readonly expand: () => void;
  readonly collapse: () => void;
  readonly group?: string;
  readonly active?: boolean;
}

export type ListItemFn<T> = (
  childProps: ListItem<T>,
) => ReactNode | ReactNode[] | string;
