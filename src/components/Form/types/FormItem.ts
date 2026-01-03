import { ReactNode } from 'react';

import { FormValidatorConfig } from '@/components/Form/types/FormValidator';

export type FormItemState = 'valid' | 'error' | 'warning';

export type StateObserver = (
  value: FormItemState,
  validationResult: ReactNode | ReactNode[] | string | undefined,
) => void;

export type DirtyObserver = (dirty: boolean) => void;

export type ValueObserver<T> = {
  handleSilentEvent?: boolean;
  listener: (value: T) => void;
};

export interface SetValueExtra {
  readonly silent?: boolean;
}

export interface FormItem<T> {
  readonly value: T;

  readonly validators: FormValidatorConfig<T>[];

  readonly state: FormItemState;

  readonly validationResult: ReactNode | ReactNode[] | string | undefined;

  readonly onValueChanges: (observer: ValueObserver<T>) => void;

  readonly onStateChanges: (observer: StateObserver) => void;

  readonly setValue: (value: T, extra?: SetValueExtra) => void;

  readonly callValueObservers: (silent?: boolean) => void;

  readonly validate: () => void;
}
