import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { FC } from 'react';

import { Typography } from '../../Typography/Typography';
import { WithChildren } from '@/core/utils/style/WithChildren';
import { modalCloseButtonCls } from '@/components/Modal/ModalTitle/ModalTitle.css';
import { Box } from '@/components/Box/Box';

export const ModalTitle: FC<WithChildren & { showCloseButton: boolean }> = ({
  children,
  showCloseButton = true,
}) => (
  <Dialog.Title asChild>
    <Typography.Text
      flex={{ justify: 'space-between', align: 'center' }}
      flexItem={{ width: '100%', marginBottom: 4 }}
      bold
    >
      {children}
      {showCloseButton && (
        <Dialog.Close asChild>
          <Box
            flex={{ align: 'center', justify: 'center' }}
            className={modalCloseButtonCls}
          >
            <X size={18} />
          </Box>
        </Dialog.Close>
      )}
    </Typography.Text>
  </Dialog.Title>
);
