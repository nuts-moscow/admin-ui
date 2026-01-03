import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import * as React from 'react';

import {
  ToggleGroupPrimitiveRootProps,
  ToggleGroupProps,
} from '@/components/ToggleGroup/ToggleGroup';
import {
  large,
  medium,
  small,
  xLarge,
  xSmall,
  xxLarge,
  xxSmall,
} from '@/core/utils/style/UiKitSizes';
import { clsx } from 'clsx';
import { toggleGroupItemCls } from '@/components/ToggleGroup/ToggleGroupItem.css';
import { FC } from 'react';
import { WithStyles } from '@/core/utils/style/WithStyles';

export type ToggleGroupItemsProps = {
  type?: ToggleGroupProps['type'];
  itemsType?: ToggleGroupPrimitiveRootProps['itemsType'];
  children: React.ReactNode;
  value: string;
  size?: xxSmall | xSmall | small | medium | large | xLarge | xxLarge;
  disabled?: boolean;
  onClick?: () => void;
  borderRadius?:
    | ('bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight')[]
    | boolean;
  border?: ('bottom' | 'left' | 'right' | 'top')[] | boolean;
  titan?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
} & WithStyles;

export const ToggleGroupItem: FC<ToggleGroupItemsProps> = ({
  type,
  itemsType,
  borderRadius,
  border,
  size,
  children,
  className,
  titan,
  ref,
  ...props
}) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={clsx(
        toggleGroupItemCls({
          fontSize: size,
          titan,
          type,
          itemsType,
          borderAll: typeof border === 'boolean',
          borderBottom: border instanceof Array && border.includes('bottom'),
          borderTop: border instanceof Array && border.includes('top'),
          borderRight: border instanceof Array && border.includes('right'),
          borderLeft: border instanceof Array && border.includes('left'),
          borderColor:
            border === true && itemsType === 'button' && type === 'secondary'
              ? 'secondary'
              : 'primary',
          borderRadiusAll: typeof borderRadius === 'boolean',
          borderRadiusBottomLeft:
            borderRadius instanceof Array &&
            borderRadius.includes('bottomLeft'),
          borderRadiusBottomRight:
            borderRadius instanceof Array &&
            borderRadius.includes('bottomRight'),
          borderRadiusTopLeft:
            borderRadius instanceof Array && borderRadius.includes('topLeft'),
          borderRadiusTopRight:
            borderRadius instanceof Array && borderRadius.includes('topRight'),
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
};
