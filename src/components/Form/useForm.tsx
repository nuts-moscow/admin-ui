import { equals } from 'ramda';
import { useEffect, useState } from 'react';

import { FormControlFullParams } from '@/components/Form/FormControl';
import { FormModel, FormModelParams } from '@/components/Form/FormModel';
import { FormValidatorConfig } from '@/components/Form/types/FormValidator';
import { Dictionary } from '@/core/types/types';

type UseFormResult<T extends Dictionary<any>> = [FormModel<T>, T];

export function useForm<T extends Dictionary<any>>(
  params: FormModelParams<T>,
  deps?: any[],
): UseFormResult<T> {
  const [[model, value], setModelState] = useState<UseFormResult<T>>(() => {
    const model = new FormModel<T>(params);
    return [model, model.value];
  });

  useEffect(() => {
    model.validate();
  }, deps || []);

  useEffect(() => {
    const unsubscribe = model.onValueChanges({
      handleSilentEvent: false,
      listener: (value) =>
        setModelState((oldValue) => {
          if (equals(oldValue[1], value)) {
            return oldValue;
          } else {
            return [oldValue[0], value];
          }
        }),
    });

    return () => unsubscribe();
  }, []);

  return [model, value];
}

export function toCtrlParam<T>(
  value: T,
  validators?: FormValidatorConfig<T>[],
): FormControlFullParams<T> {
  return {
    validators,
    value,
    __config__: true,
  };
}
