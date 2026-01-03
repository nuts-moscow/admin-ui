import * as Dialog from '@radix-ui/react-dialog';
import { FC, ReactNode, useEffect, useState } from 'react';

import { ModalCard } from '../ModalCard/ModalCard';
import { ModalContextProvider } from '../ModalContext/ModalContext';
import { modalOverlayCls } from '@/components/Modal/Modal/Modal.css';

export interface ModalProps {
  readonly modalKey: string;
  readonly opened?: boolean;
  readonly onClose?: (res?: unknown) => void;
  readonly onOpen?: () => void;
  readonly disableOverlay?: boolean;
  readonly children?:
    | ReactNode
    | ((params: {
        onClose?: ModalProps['onClose'];
        opened?: boolean;
      }) => ReactNode);
}

export const Modal: FC<ModalProps> = ({
  opened,
  onOpen,
  onClose,
  children,
  modalKey,
  disableOverlay,
}) => {
  const [localOpened, setLocalOpened] = useState<boolean | undefined>(opened);
  useEffect(() => {
    let timerId: any;

    if (opened) {
      setLocalOpened(opened);
    } else {
      timerId = setTimeout(() => setLocalOpened(opened), 250);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [opened]);

  useEffect(() => {
    if (opened && onOpen) {
      onOpen();
    }
  }, [opened]);

  const handleOpenChange = (opened: boolean) => {
    if (!opened && onClose) {
      onClose();
    }
  };

  return (
    <ModalContextProvider modalKey={modalKey}>
      <Dialog.Root open={localOpened} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            onPointerDown={
              disableOverlay
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                : undefined
            }
            className={modalOverlayCls({
              closing: !opened && localOpened,
              opening: localOpened && opened,
            })}
          />
          <ModalCard
            closing={!opened && localOpened}
            opening={localOpened && opened}
          >
            {children instanceof Function
              ? children({ opened, onClose })
              : children}
          </ModalCard>
        </Dialog.Portal>
      </Dialog.Root>
    </ModalContextProvider>
  );
};
