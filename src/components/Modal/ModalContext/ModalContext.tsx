import { createContext, CSSProperties, FC, useContext, useState } from 'react';

import { noop } from '@/core/utils/misc/noop';
import { WithChildren } from '@/core/utils/style/WithChildren';

export interface ModalContextParams {
  readonly width?: CSSProperties['width'];
  readonly maxWidth?: CSSProperties['maxWidth'];
  readonly minWidth?: CSSProperties['minWidth'];
  readonly height?: CSSProperties['height'];
  readonly maxHeight?: CSSProperties['maxHeight'];
  readonly minHeight?: CSSProperties['minHeight'];
  readonly padding?: number;
}

interface ModalContextType {
  params: ModalContextParams;
  setParams: (params: ModalContextParams) => void;
  modalKey: string;
}

const ModalContext = createContext<ModalContextType>({
  params: {},
  setParams: noop,
  modalKey: '',
});

export const ModalContextProvider: FC<WithChildren & { modalKey: string }> = ({
  children,
  modalKey,
}) => {
  const [params, setParams] = useState<ModalContextParams>({});

  return (
    <ModalContext.Provider value={{ params, setParams, modalKey }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalParamsContext = (): ModalContextType =>
  useContext(ModalContext);
