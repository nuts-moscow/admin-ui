'use client';
import { AlertTriangle, CheckCheck, Loader2, X } from 'lucide-react';
import { ReactNode } from 'react';
import { toast as toastLib } from 'sonner';
import { Box } from '../Box/Box';
import { Button } from '../Button/Button';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  closeCls,
  loaderCls,
  toastContainerCls,
} from '@/components/Toast/Toasts.css';
import { Typography } from '@/components/Typography/Typography';

export type ToastProps = {
  readonly message: ReactNode;
  readonly type?: 'info' | 'success' | 'warning' | 'error' | 'loading';
  readonly hint?: ReactNode;
  readonly action?: (router: AppRouterInstance) => void;
  readonly actionName?: ReactNode;
  readonly closable?: boolean;
  readonly onClose?: () => void;
  readonly extra?: ReactNode;
  readonly duration?: number | 'infinity';
  readonly position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
};

export const Toast = ({
  type = 'info',
  message,
  hint,
  closable,
  onClose,
  extra,
  actionName,
  action,
}: ToastProps) => {
  const router = useRouter();
  let icon: ReactNode = null;

  switch (type) {
    case 'loading':
      icon = (
        <Loader2
          className={loaderCls}
          width={20}
          height={20}
          color="var(--text-success)"
        />
      );
      break;
    case 'success':
      icon = <CheckCheck width={20} height={20} color="var(--text-success)" />;
      break;
    case 'warning':
      icon = (
        <AlertTriangle width={20} height={20} color="var(--text-warning)" />
      );
      break;
    case 'error':
      icon = <AlertTriangle width={20} height={20} color="var(--text-error)" />;
      break;
  }

  return (
    <Box
      className={toastContainerCls}
      padding={5}
      flex={{ gap: 3, width: 316 }}
    >
      {icon}
      {closable && <X className={closeCls} size={16} onClick={onClose} />}
      <Box flex={{ row: true, gap: 2 }}>
        <Box flexItem={{ flex: 1 }} flex={{ col: true }}>
          <Typography.Text bold size="medium" type="primary">
            {message}
          </Typography.Text>
          {hint && (
            <Typography.Text size="small" type="primary">
              {hint}
            </Typography.Text>
          )}
          {extra && (
            <Box flex={{ justify: 'flex-start' }} flexItem={{ marginTop: 1 }}>
              {extra}
            </Box>
          )}
        </Box>
        {actionName && action && (
          <Box flex={{ align: 'center', gap: 1 }} flexItem={{ marginTop: 3 }}>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                action(router);
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              {actionName}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const toast = ({
  type = 'info',
  message,
  hint,
  action,
  actionName,
  closable = true,
  extra,
  onClose,
  duration,
  position,
}: ToastProps) => {
  const callback = action
    ? (_: string | number, navigate: AppRouterInstance) => {
        action(navigate);
        return;
      }
    : undefined;
  return toastLib.custom(
    (t) => (
      <Toast
        action={callback ? (router) => callback(t, router) : undefined}
        type={type}
        message={message}
        hint={hint}
        actionName={actionName}
        closable={closable}
        onClose={() => {
          toastLib.dismiss(t);
          if (onClose) {
            onClose();
          }
        }}
        extra={extra}
      />
    ),
    {
      position: position || 'bottom-right',
      duration: duration === 'infinity' ? Infinity : 3000,
    },
  );
};
