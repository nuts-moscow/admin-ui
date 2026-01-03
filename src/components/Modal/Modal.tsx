import { FC, useEffect, useState } from 'react';

import { Modal as BaseModal, ModalProps } from '@/components/Modal/Modal/Modal';
import { ModalContent } from '@/components/Modal/ModalContent/ModalContent';
import { useModalManager } from '@/components/Modal/ModalManager';
import { ModalTitle } from '@/components/Modal/ModalTitle/ModalTitle';
import { makeRandomKey } from '@/core/utils/misc/makeRandomKey';

export interface WithModalProps<InitialData = any> {
  readonly close: (res?: unknown) => void;
  readonly opened: boolean;
  readonly initialData: InitialData;
}

export function useModal<
  T extends FC<any>,
  P = T extends FC<infer P>
    ? Omit<Omit<Omit<P, 'opened'>, 'close'>, 'initialData'>
    : never,
>(
  Component: T,
): [
  FC<Omit<Omit<ModalProps, 'opened'>, 'modalKey'> & P>,
  (initialData?: any) => void,
  () => void,
] {
  const [key] = useState<string>(makeRandomKey(10));

  useEffect(() => {
    useModalManager.data.registerModal(key);

    return () => useModalManager.data.unregisterModal(key);
  }, []);

  const [modal] = useState(() =>
    // eslint-disable-next-line react/display-name
    ({ onClose, onOpen, disableOverlay, ...rest }: Omit<ModalProps, 'opened' | 'modalKey'> & P) => {
      const {
        data: { registeredModals },
        // eslint-disable-next-line react-hooks/rules-of-hooks
      } = useModalManager();

      const opened = registeredModals[key];
      const handleClose = (res?: unknown) => {
        useModalManager.data.registeredModalsBeforeClose[key]?.();
        useModalManager.data.toggleModal(key, false);
        if (onClose) {
          onClose(res);
        }
      };

      return (
        <BaseModal
          onClose={handleClose}
          disableOverlay={disableOverlay}
          onOpen={onOpen}
          opened={opened}
          modalKey={key}
        >
          {/*@ts-expect-error-ignore*/}
          <Component
            {...rest}
            opened={opened}
            close={handleClose}
            initialData={useModalManager.data.registeredModalsInitialData[key]}
          />
        </BaseModal>
      );
    },
  );

  return [
    modal,
    (initialData: any) => {
      useModalManager.data.registeredModalsInitialData[key] = initialData;
      useModalManager.data.toggleModal(key, true);
    },
    () => {
      useModalManager.data.toggleModal(key, false);
    },
  ];
}

// @ts-expect-error-ignore
export const Modal: typeof Modal & {
  Title: typeof ModalTitle;
  Content: typeof ModalContent;
} = BaseModal;
Modal.Title = ModalTitle;
Modal.Content = ModalContent;
