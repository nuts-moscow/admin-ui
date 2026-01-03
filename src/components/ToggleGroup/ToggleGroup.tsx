import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import React, {
  cloneElement,
  CSSProperties,
  FC,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import {
  large,
  medium,
  small,
  xLarge,
  xSmall,
  xxLarge,
  xxSmall,
} from '@/core/utils/style/UiKitSizes';
import {
  ToggleGroupItem,
  ToggleGroupItemsProps,
} from '@/components/ToggleGroup/ToggleGroupItem';
import { clsx } from 'clsx';
import { toggleGroupCls } from '@/components/ToggleGroup/ToggleGroup.css';

export type ToggleGroupPrimitiveRootProps = React.ComponentPropsWithRef<
  typeof ToggleGroupPrimitive.Root
> & {
  readonly itemsType: 'button' | 'buttonGroup' | 'tab';
  readonly size?: xxSmall | xSmall | small | medium | large | xLarge | xxLarge;
  readonly height?: CSSProperties['height'];
  readonly border?: ('bottom' | 'left' | 'right' | 'top')[] | boolean;
};

export interface ToggleGroupProps
  extends Omit<ToggleGroupPrimitiveRootProps, 'type'> {
  readonly type: 'primary' | 'sell' | 'buy' | 'ghost' | 'secondary';
  readonly value: string;
  readonly onTabChange?: (activeToggleValue: string) => void;
  readonly width?: CSSProperties['width'];
}

export const ToggleGroup: FC<ToggleGroupProps> & {
  Item: typeof ToggleGroupItem;
} = ({
  value,
  itemsType,
  size,
  onTabChange,
  onValueChange,
  children,
  type,
  border,
  width,
  ref,
  className,
  style,
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (value: string | undefined) => {
    if (!!value && onValueChange) {
      // @ts-expect-error-ignore
      onValueChange(value);
    }
    setLocalValue(value || localValue);
    if (onTabChange) onTabChange(value || localValue);
  };

  const normalizedChildren = React.Children.map(children, (child) => {
    if (isValidElement<ToggleGroupItemsProps>(child)) {
      return cloneElement(child, {
        type: itemsType === 'tab' ? 'ghost' : child.props.type || type,
        itemsType,
      });
    }
    return child;
  });

  return (
    // @ts-expect-error-ignore
    <ToggleGroupPrimitive.Root
      onValueChange={handleChange}
      className={clsx(
        toggleGroupCls({
          size,
          itemsType,
          borderAll: typeof border === 'boolean',
          borderBottom: border instanceof Array && border.includes('bottom'),
          borderTop: border instanceof Array && border.includes('top'),
          borderRight: border instanceof Array && border.includes('right'),
          borderLeft: border instanceof Array && border.includes('left'),
        }),
        className,
      )}
      style={{ ...style, width }}
      ref={ref}
      value={localValue}
      type="single"
      {...props}
    >
      {normalizedChildren}
    </ToggleGroupPrimitive.Root>
  );
};

ToggleGroup.Item = ToggleGroupItem;
