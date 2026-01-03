import { equals } from 'ramda';
import { FC, ReactNode, useEffect, useState } from 'react';

import { useFormContext } from '@/components/Form/FormContext';
import { FormModel } from '@/components/Form/FormModel';
import {
  FormItemState,
  StateObserver,
  ValueObserver,
} from '@/components/Form/types/FormItem';

export interface FormListenerParams<T> {
  readonly value: T;
  readonly state: FormItemState;
  readonly parent: FormModel<any> | undefined;
  readonly validationResult: ReactNode | ReactNode[] | string | undefined;
}
export interface FormListenerViewProps<T> {
  readonly name?: string;
  readonly children: (
    params: FormListenerParams<T>,
  ) => ReactNode | ReactNode[] | string;
}

export const FormListenerView: FC<FormListenerViewProps<any>> = ({
  name,
  children,
}) => {
  const form = useFormContext();
  const [{ value, validationResult, state }, setControlData] = useState<{
    readonly value: any;
    readonly state: FormItemState;
    readonly validationResult: ReactNode | ReactNode[] | string | undefined;
  }>({
    value: name ? form.controls[name].value : form.value,
    state: name ? form.controls[name].state : form.state,
    validationResult: name
      ? form.controls[name].validationResult
      : form.validationResult,
  });

  useEffect(() => {
    const valueObserver: ValueObserver<any> = {
      handleSilentEvent: true,
      listener: (value: any) => {
        setControlData((controlData) => {
          const newControlData = { ...controlData, value };

          if (equals(newControlData, controlData)) {
            return controlData;
          } else {
            return newControlData;
          }
        });
      },
    };
    const unwatchValue = name
      ? form.controls[name].onValueChanges(valueObserver)
      : form.onValueChanges(valueObserver);

    const stateObserver: StateObserver = (state, validationResult) => {
      setControlData((controlData) => {
        const newControlData = { ...controlData, state, validationResult };

        if (equals(newControlData, controlData)) {
          return controlData;
        } else {
          return newControlData;
        }
      });
    };
    const unwatchState = name
      ? form.controls[name].onStateChanges(stateObserver)
      : form.onStateChanges(stateObserver);

    return () => {
      unwatchValue();
      unwatchState();
    };
  }, []);

  return children({
    value,
    validationResult,
    state,
    parent: name ? form : undefined,
  });
};
