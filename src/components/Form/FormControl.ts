import { ReactNode } from 'react';

import {
  DirtyObserver,
  FormItem,
  FormItemState,
  SetValueExtra,
  StateObserver,
  ValueObserver,
} from '@/components/Form/types/FormItem';
import {
  FormValidatorConfig,
  FormValidatorInternalResult,
} from '@/components/Form/types/FormValidator';
import { equals } from 'ramda';

export interface FormControlFullParams<T> {
  readonly value: T;
  readonly validators?: FormValidatorConfig<T>[];
  readonly __config__: true;
}

export type FormControlParams<T> = FormControlFullParams<T> | T;

export function isFormControlFullParams<T>(
  formControlParams: FormControlParams<T>,
): formControlParams is FormControlFullParams<T> {
  return (formControlParams as any)?.__config__;
}

export class FormControl<T> implements FormItem<T> {
  value: T;

  validators: FormValidatorConfig<T>[] = [];

  state: FormItemState = 'valid';

  dirty = false;

  validationResult: ReactNode | ReactNode[] | string | undefined;

  private stateObservers: StateObserver[] = [];

  private dirtyObservers: DirtyObserver[] = [];

  private valueObservers: ValueObserver<T>[] = [];

  constructor(
    public name: string,
    public parent: FormItem<any> | undefined,
    public formControlParams: FormControlParams<T>,
  ) {
    this.value = this.getValueFromParams(formControlParams);
    this.validators = this.getValidatorsFromParams(formControlParams);
    this.callValueObservers();
    this.validateWithoutParentCall();
  }

  onDirtyChanges(observer: DirtyObserver): () => void {
    this.dirtyObservers = this.dirtyObservers.concat([observer]);
    observer(this.dirty);
    return () => {
      this.dirtyObservers = this.dirtyObservers.filter((dO) => dO !== observer);
    };
  }

  onStateChanges(observer: StateObserver): () => void {
    this.stateObservers = this.stateObservers.concat([observer]);
    observer(this.state, this.validationResult);
    return () => {
      this.stateObservers = this.stateObservers.filter((so) => so !== observer);
    };
  }

  onValueChanges(observer: ValueObserver<T>): () => void {
    this.valueObservers = this.valueObservers.concat([observer]);
    observer.listener(this.value);
    return () => {
      this.valueObservers = this.valueObservers.filter((vo) => vo !== observer);
    };
  }

  setValue(value: T, extra?: SetValueExtra): void {
    if (equals(value, this.value)) {
      return;
    }
    this.setValueWithoutParentCall(value, extra);
    if (this.parent) {
      this.parent.callValueObservers(extra?.silent);
      this.parent.validate();
    }
  }

  markAsDirty() {
    this.dirty = true;
    this.dirtyObservers.forEach((dO) => dO(this.dirty));
  }

  validate() {
    this.validateWithoutParentCall();
    if (this.parent) {
      this.parent.validate();
    }
  }

  callValueObservers(isSilentEvent = false): void {
    this.valueObservers.forEach((vo) => {
      if (!isSilentEvent) {
        vo.listener(this.value);
      } else if (vo.handleSilentEvent) {
        vo.listener(this.value);
      }
    });
  }

  private getValueFromParams(formControlParams: FormControlParams<T>): T {
    if (isFormControlFullParams(formControlParams)) {
      return formControlParams.value;
    }
    return formControlParams;
  }

  private setValueWithoutParentCall(value: T, extra?: SetValueExtra): void {
    this.value = value;
    this.callValueObservers(extra?.silent);
    this.validateWithoutParentCall();
  }

  private validateWithoutParentCall() {
    const controlValidity = this.checkControlValueValidity(
      this.value,
      this.validators,
    );
    if (controlValidity.state === 'valid' && this.state === 'valid') {
      return;
    }
    this.validationResult = controlValidity.content;
    this.state = controlValidity.state;
    this.stateObservers.forEach((so) => so(this.state, this.validationResult));
  }

  private getValidatorsFromParams(
    formControlParams: FormControlParams<T>,
  ): FormValidatorConfig<T>[] {
    if (isFormControlFullParams(formControlParams)) {
      return formControlParams.validators || [];
    }
    return [];
  }

  private checkControlValueValidity(
    value: T,
    validators: FormValidatorConfig<T>[],
  ): FormValidatorInternalResult {
    for (let i = 0; i < validators.length; i++) {
      const result = validators[i].validate(value);

      if (result) {
        return {
          state: validators[i].level,
          content: result,
        };
      }
    }

    return {
      content: undefined,
      state: 'valid',
    };
  }
}
