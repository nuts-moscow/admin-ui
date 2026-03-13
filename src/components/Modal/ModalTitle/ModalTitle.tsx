import * as Dialog from "@radix-ui/react-dialog";
import { X } from 'lucide-react';
import { FC } from 'react';

import { Typography } from '../../Typography/Typography';
import { WithChildren } from '@/core/utils/style/WithChildren';
import { modalCloseButtonCls } from '@/components/Modal/ModalTitle/ModalTitle.css';
import { Box } from '@/components/Box/Box';
import { useModalParamsContext } from '@/components/Modal/ModalContext/ModalContext';
import { useModalManager } from '@/components/Modal/ModalManager';
import { useIsInsideModalDialog } from "@/components/Modal/ModalDialogContext";

export const ModalTitle: FC<
  WithChildren & { showCloseButton?: boolean; close?: () => void }
> = ({
  children,
  showCloseButton = true,
  close,
}) => {
  const context = useModalParamsContext();
  const isInsideDialog = useIsInsideModalDialog();
  const handleClose = () => {
    if (close) {
      close();
      return;
    }
    useModalManager.data.toggleModal(context.modalKey, false);
  };

  const content = (
    <Typography.Text
      flex={{ justify: 'space-between', align: 'center' }}
      flexItem={{ width: '100%', marginBottom: 4 }}
      bold
    >
      {children}
      {showCloseButton && (
        <Box
          flex={{ align: 'center', justify: 'center' }}
          className={modalCloseButtonCls}
          onClick={handleClose}
        >
          <X size={18} />
        </Box>
      )}
    </Typography.Text>
  );

  if (isInsideDialog) {
    return <Dialog.Title asChild>{content}</Dialog.Title>;
  }

  return content;
};
