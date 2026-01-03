import { Dictionary } from '@/core/types/types';

import { inMemoryState } from '@/core/stateManager/factories/inMemoryState';

export interface ModalManager {
  readonly registeredModals: Dictionary<boolean>;
  readonly registerModal: (modalKey: string) => void;
  readonly unregisterModal: (modalKey: string) => void;
  readonly toggleModal: (modalKey: string, opened: boolean) => void;
  readonly registeredModalsInitialData: {
    [key: string]: any;
  };
  readonly registeredModalsBeforeClose: {
    [key: string]: () => void;
  };
}

export const useModalManager = inMemoryState<ModalManager>({
  readonly: true,
  defaultValue: {
    registeredModals: {},
    registeredModalsInitialData: {},
    registeredModalsBeforeClose: {},
    registerModal(modalKey) {
      useModalManager.setData({
        ...this,
        registeredModals: {
          ...this.registeredModals,
          [modalKey]: false,
        },
      });
    },
    unregisterModal(modalKey) {
      useModalManager.setData({
        ...this,
        registeredModals: {
          ...this.registeredModals,
          [modalKey]: undefined as any,
        },
        registeredModalsInitialData: {
          ...this.registeredModalsInitialData,
          [modalKey]: undefined as any,
        },
        registeredModalsBeforeClose: {
          ...this.registeredModalsBeforeClose,
          [modalKey]: undefined as any,
        },
      });
    },
    toggleModal(modalKey, opened) {
      useModalManager.setData({
        ...this,
        registeredModals: {
          ...this.registeredModals,
          [modalKey]: opened,
        },
      });
    },
  },
});
