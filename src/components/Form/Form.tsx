import { CSSProperties, FormEvent, useState } from 'react';
import { Dictionary } from '@/core/types/types';
import { WithChildren } from '@/core/utils/style/WithChildren';
import { FormModel } from '@/components/Form/FormModel';
import { withFlex } from '@/components/Flex/Flex';
import { FormContext } from '@/components/Form/FormContext';
import { FormControlView } from '@/components/Form/FormControlView';
import { FormListenerView } from '@/components/Form/FormListenerView';

export interface FormViewProps<T extends Dictionary<any>> extends WithChildren {
  readonly model: FormModel<T>;
  readonly onSubmit?: (form: FormModel<T>) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const _Form = withFlex(
  ({ model, onSubmit, children, className, style }: FormViewProps<any>) => {
    const [_model] = useState(model);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(_model);
      }
    };

    return onSubmit ? (
      <form onSubmit={handleSubmit} className={className} style={style}>
        <FormContext.Provider value={_model}>{children}</FormContext.Provider>
      </form>
    ) : (
      <div className={className}>
        <FormContext.Provider value={_model}>{children}</FormContext.Provider>
      </div>
    );
  },
);

//@ts-expect-error-ignore
const Form: typeof _Form & {
  Control: typeof FormControlView;
  Listener: typeof FormListenerView;
} = _Form;
Form.Control = FormControlView;
Form.Listener = FormListenerView;

export { Form };
