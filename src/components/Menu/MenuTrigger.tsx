'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { menuTriggerCls } from '@/components/Menu/Menu.css';
import { clsx } from 'clsx';

type MenuPrimitiveTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Trigger
>;

export const MenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  MenuPrimitiveTriggerProps
>(({ children, className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Trigger
      className={clsx(menuTriggerCls, className)}
      {...props}
      ref={ref}
    >
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
});

MenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;
