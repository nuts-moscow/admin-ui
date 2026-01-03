import { equals } from 'ramda';
import { FC, ReactNode, useEffect, useState } from 'react';

import { useFormContext } from '@/components/Form/FormContext';
import { FormModel } from '@/components/Form/FormModel';
import { FormItemState, SetValueExtra } from '@/components/Form/types/FormItem';

export interface FormControlParams<T> {
  readonly value: T;
  readonly onChange: (value: T, extra?: SetValueExtra) => void;
  readonly state: FormItemState;
  readonly dirty: boolean;
  readonly parent: FormModel<any>;
  readonly validationResult: ReactNode | ReactNode[] | string | undefined;
}

export type Control<T> = Omit<Partial<FormControlParams<T>>, 'children'>;

export interface FormControlViewProps<T> {
  readonly name: string;
  readonly children: (
    params: FormControlParams<T>,
  ) => ReactNode | ReactNode[] | string;
}

export const FormControlView: FC<FormControlViewProps<any>> = ({
  name,
  children,
}) => {
  const form = useFormContext();
  const [{ value, validationResult, state, dirty }, setControlData] = useState<{
    readonly value: any;
    readonly state: FormItemState;
    readonly dirty: boolean;
    readonly validationResult: ReactNode | ReactNode[] | string | undefined;
  }>({
    value: form.controls[name].value,
    state: form.controls[name].state,
    dirty: form.controls[name].dirty,
    validationResult: form.controls[name].validationResult,
  });

  useEffect(() => {
    const unwatchValue = form.controls[name].onValueChanges({
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
    });
    const unwatchState = form.controls[name].onStateChanges(
      (state, validationResult) => {
        setControlData((controlData) => {
          const newControlData = { ...controlData, state, validationResult };

          if (equals(newControlData, controlData)) {
            return controlData;
          } else {
            return newControlData;
          }
        });
      },
    );
    const unwatchDirty = form.controls[name].onDirtyChanges((dirty) => {
      setControlData((controlData) => {
        const newControlData = { ...controlData, dirty };

        if (equals(newControlData, controlData)) {
          return controlData;
        } else {
          return newControlData;
        }
      });
    });

    return () => {
      unwatchValue();
      unwatchState();
      unwatchDirty();
    };
  }, []);

  return children({
    value,
    validationResult,
    state,
    dirty,
    parent: form,
    onChange: (value: any, extra) => {
      form.controls[name].setValue(value, extra);
      form.controls[name].markAsDirty();
    },
  });
};
