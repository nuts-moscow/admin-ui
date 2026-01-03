import { FC, useEffect } from 'react';

import {
  ModalContextParams,
  useModalParamsContext,
} from '@/components/Modal/ModalContext/ModalContext';
import { WithChildren } from '@/core/utils/style/WithChildren';
import { useModalManager } from '@/components/Modal/ModalManager';

export type ModalContentProps = ModalContextParams &
  WithChildren & {
    beforeClose?: () => void;
  };

export const ModalContent: FC<ModalContentProps> = ({
  children,
  beforeClose,
  ...rest
}) => {
  const context = useModalParamsContext();

  useEffect(() => {
    context.setParams(rest);
  }, [
    rest.height,
    rest.minHeight,
    rest.maxHeight,
    rest.width,
    rest.minWidth,
    rest.maxWidth,
    rest.padding,
  ]);

  useEffect(() => {
    useModalManager.data.registeredModalsBeforeClose[context.modalKey] =
      beforeClose as any;
  }, [beforeClose]);

  return <>{children}</>;
};
