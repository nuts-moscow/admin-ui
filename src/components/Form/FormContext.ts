import { createContext, useContext } from 'react';

import { FormModel } from '@/components/Form/FormModel';
import { Dictionary } from '@/core/types/types';

export const FormContext = createContext<FormModel<any>>({} as any);

export const useFormContext = <
  T extends Dictionary<any> = any,
>(): FormModel<T> => useContext(FormContext);
