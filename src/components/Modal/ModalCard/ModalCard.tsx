import * as Dialog from '@radix-ui/react-dialog';
import { CSSProperties, ReactNode, useMemo } from 'react';
import { useModalParamsContext } from '../ModalContext/ModalContext';
import { modalCardCls } from '@/components/Modal/ModalCard/ModalCard.css';
import { getGutter } from '@/core/utils/style/gutter';

export interface ModalContentProps {
  readonly closing?: boolean;
  readonly opening?: boolean;
  readonly children?: ReactNode;
}

export const ModalCard = ({
  children,
  opening,
  closing,
}: ModalContentProps) => {
  const context = useModalParamsContext();

  const modalCardStyles = useMemo<CSSProperties>(() => {
    return {
      height: context.params.height || undefined,
      maxHeight: context.params.maxHeight || undefined,
      minHeight: context.params.minHeight || undefined,
      width: context.params.width,
      maxWidth: context.params.maxWidth,
      minWidth: context.params.minWidth || 300,
      padding: context.params.padding
        ? getGutter(context.params.padding)
        : undefined,
    };
  }, [context.params]);

  return (
    <Dialog.Content
      className={modalCardCls({
        opening,
        closing,
      })}
      style={modalCardStyles}
    >
      {children}
    </Dialog.Content>
  );
};
