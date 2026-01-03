import { ReactNode } from 'react';

import { FormItemState } from '@/components/Form/types/FormItem';

export type FormValidator<T> = (
  value: T,
) => ReactNode | ReactNode[] | string | undefined;

export interface FormValidatorConfig<T> {
  readonly validate: FormValidator<T>;
  readonly level: Exclude<FormItemState, 'valid'>;
}

export interface FormValidatorInternalResult {
  readonly state: FormItemState;
  readonly content: ReactNode | ReactNode[] | string | undefined;
}
