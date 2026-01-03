import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';
import React, {
  CSSProperties,
  FC,
  forwardRef,
  isValidElement,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import { large, medium, small } from '@/core/utils/style/UiKitSizes';
import { getGutter, Gutter } from '@/core/utils/style/gutter';
import { Box } from '@/components/Box/Box';
import {
  tooltipArrowCls,
  tooltipContentCls,
  tooltipIconQuestionCls,
  tooltipTriggerCls,
} from '@/components/Tooltip/Tooltip.css';
import { Info } from '@/components/Icons/Info/Info';
import { clsx } from 'clsx';

type TooltipSize = small | medium | large;

const DEFAULT_WIDTH = 285;

interface TooltipProps {
  readonly disableAnimation?: boolean;
  readonly children?: ReactNode;
  readonly content: ReactNode;
  readonly size?: TooltipSize;
  readonly side?: TooltipPrimitive.TooltipContentProps['side'];
  readonly tooltipWidth?: CSSProperties['width'];
  readonly maxWidth?: CSSProperties['width'];
  readonly type?:
    | 'info'
    | 'question'
    | 'info-success'
    | 'info-warning'
    | 'none';
  readonly padding?: Gutter;
  readonly trigger?: 'hover' | 'click';
  readonly disableOnMobile?: boolean;
  readonly className?: string;
}

type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  readonly tooltipWidth?: CSSProperties['width'];
  readonly maxWidth?: CSSProperties['width'];
  readonly padding?: Gutter;
  readonly disableAnimation?: boolean;
};
const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      disableAnimation,
      className,
      maxWidth,
      tooltipWidth,
      padding,
      style,
      ...props
    },
    ref,
  ) => {
    const primitiveContentStyle = useMemo((): CSSProperties => {
      return {
        maxWidth: maxWidth || undefined,
        padding: getGutter(padding || 4),
        width: tooltipWidth || DEFAULT_WIDTH,
      };
    }, [maxWidth, tooltipWidth, padding]);

    return (
      <TooltipPrimitive.Content
        ref={ref}
        className={clsx(
          className,
          tooltipContentCls({ animationOn: !disableAnimation }),
        )}
        style={{ ...primitiveContentStyle, ...style }}
        {...props}
      />
    );
  },
);

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

function getIconSize(size: TooltipSize) {
  switch (size) {
    case 'small':
      return 12;
    case 'medium':
      return 18;
    case 'large':
      return 20;
    default:
      return 18;
  }
}
export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  size = 'medium',
  type = 'question',
  tooltipWidth,
  maxWidth,
  padding,
  trigger = 'hover',
  side,
  disableOnMobile,
  disableAnimation,
  className,
}) => {
  const tooltipTrigger = trigger;

  const iconSize = getIconSize(size);

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const tooltipContent = (
    <TooltipPrimitive.Portal>
      <TooltipContent
        disableAnimation={disableAnimation}
        side={side}
        tooltipWidth={tooltipWidth}
        maxWidth={maxWidth}
        padding={padding}
        className={className}
        onPointerDownOutside={() => setOpen(false)}
      >
        {content}
        <TooltipPrimitive.Arrow className={tooltipArrowCls} />
      </TooltipContent>
    </TooltipPrimitive.Portal>
  );

  if (type === 'none') {
    return (
      <TooltipPrimitive.Provider
        disableHoverableContent
        skipDelayDuration={2_000}
      >
        <TooltipPrimitive.Root
          delayDuration={0}
          open={tooltipTrigger === 'click' ? open : undefined}
        >
          <TooltipPrimitive.Trigger
            className={tooltipTriggerCls}
            asChild={isValidElement(children)}
            onClick={() => handleClick()}
          >
            {children}
          </TooltipPrimitive.Trigger>
          {tooltipContent}
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  }

  return (
    <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={2_000}>
      <TooltipPrimitive.Root
        open={tooltipTrigger === 'click' ? open : undefined}
      >
        <Box flex={{ justify: 'center', align: 'center' }}>
          {children && <Box flexItem={{ marginRight: 1 }}>{children}</Box>}
          <TooltipPrimitive.Trigger
            className={tooltipTriggerCls}
            asChild
            onClick={() => handleClick()}
          >
            {type === 'info' ||
            type === 'info-success' ||
            type === 'info-warning' ? (
              <Info
                size={iconSize}
                success={type === 'info-success'}
                warning={type === 'info-warning'}
              />
            ) : (
              <HelpCircle className={tooltipIconQuestionCls} size={iconSize} />
            )}
          </TooltipPrimitive.Trigger>
        </Box>
        {tooltipContent}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
