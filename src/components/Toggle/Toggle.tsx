import * as Switch from '@radix-ui/react-switch';
import * as React from 'react';
import { medium, small } from '@/core/utils/style/UiKitSizes';
import { withFlex } from '@/components/Flex/Flex';
import {
  toggleContainerCls,
  toggleThumbCls,
} from '@/components/Toggle/Toggle.css';
import { clsx } from 'clsx';

type ToggleSize = small | medium;

type ToggleProps = React.ComponentPropsWithoutRef<typeof Switch.Root> & {
  size?: ToggleSize;
};

export const Toggle = withFlex(
  // eslint-disable-next-line react/display-name
  React.forwardRef<
    React.ComponentRef<typeof Switch.Root> & ToggleSize,
    ToggleProps
  >(({ size = 'medium', className, ...props }, ref) => {
    return (
      <Switch.Root
        className={clsx(className, toggleContainerCls({ size }))}
        {...props}
        ref={ref}
      >
        <Switch.Thumb className={toggleThumbCls({ size })} />
      </Switch.Root>
    );
  }),
);
Toggle.displayName = Switch.Root.displayName;
