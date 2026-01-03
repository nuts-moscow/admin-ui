'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { clsx } from 'clsx';
import { menuContentCls } from '@/components/Menu/Menu.css';

type MenuPrimitiveContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>;

export const MenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  MenuPrimitiveContentProps
>(({ sideOffset = 4, className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={clsx(menuContentCls, className)}
      {...props}
    />
  );
});

MenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
