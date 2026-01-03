import { equals } from 'ramda';
import { ReactNode } from 'react';

import { FormControl, FormControlParams } from './FormControl';
import {
  FormItem,
  FormItemState,
  SetValueExtra,
  StateObserver,
  ValueObserver,
} from './types/FormItem';
import {
  FormValidatorConfig,
  FormValidatorInternalResult,
} from './types/FormValidator';
import { Dictionary } from '@/core/types/types';

export interface FormModelParams<T extends Dictionary<any>> {
  readonly controls: { [key in keyof T]: FormControlParams<T[key]> };
  readonly validators?: FormValidatorConfig<T>[];
}

export class FormModel<T extends Dictionary<any>> implements FormItem<T> {
  private controlsArray: FormControl<T[keyof T]>[];

  private stateObservers: StateObserver[] = [];

  private valueObservers: ValueObserver<T>[] = [];

  controls: { [key in keyof T]: FormControl<T[key]> };

  validators: FormValidatorConfig<T>[];

  get value(): T {
    return this.controlsArray.reduce<T>(
      (acc, ctrl) => ({
        ...acc,
        [ctrl.name]: ctrl.value,
      }),
      {} as T,
    );
  }

  get dirty(): boolean {
    return this.controlsArray.some((ctrl) => ctrl.dirty);
  }

  state: FormItemState = 'valid';

  validationResult: ReactNode | ReactNode[] | string | undefined;

  constructor(public formModelParams: FormModelParams<T>) {
    this.controlsArray = Object.entries(formModelParams.controls).map(
      ([name, params]: [string, FormControlParams<any>]) =>
        new FormControl(name, this, params),
    );
    this.controls = this.controlsArray.reduce(
      (acc, formControl) => ({
        ...acc,
        [formControl.name]: formControl,
      }),
      {} as { [key in keyof T]: FormControl<T[key]> },
    );
    this.validators = formModelParams.validators || [];
    this.callValueObservers();
    this.validateWithoutChildrenUpdate();
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

  setValue(partialValue: Partial<T>, extra?: SetValueExtra | undefined): void {
    const value = { ...this.value, ...partialValue };
    if (equals(this.value, value)) {
      return;
    }
    Object.entries(partialValue).forEach(([key, ctrlValue]) =>
      this.controls[key as keyof T]['setValueWithoutParentCall'](
        ctrlValue,
        extra,
      ),
    );
    this.callValueObservers(extra?.silent);
    this.validateWithoutChildrenUpdate();
  }

  validate() {
    this.controlsArray.forEach((ctrl) => ctrl['validateWithoutParentCall']());
    this.validateWithoutChildrenUpdate();
  }

  markAsDirty() {
    this.controlsArray.forEach((ctrl) => ctrl.markAsDirty());
  }

  private validateWithoutChildrenUpdate() {
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
    const controlWithErrors = this.controlsArray.find(
      (ctrl) => ctrl.state !== 'valid',
    );

    if (controlWithErrors) {
      return {
        state: controlWithErrors.state,
        content: controlWithErrors.validationResult,
      };
    } else {
      return {
        state: 'valid',
        content: undefined,
      };
    }
  }
}
