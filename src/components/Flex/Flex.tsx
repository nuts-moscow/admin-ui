import { ComponentClass, CSSProperties, FC, useMemo } from 'react';
import { getGutter, Gutter } from '@/core/utils/style/gutter';
import { WithStyles } from '@/core/utils/style/WithStyles';
import { clsx } from 'clsx';
import { flexItemCls, flexCls } from '@/components/Flex/Flex.css';
import { uint } from '@/core/types/types';

export interface WithFlex {
  readonly flex?:
    | {
        row?: boolean;
        col?: boolean;
        reverse?: boolean;
        inline?: boolean;
        width?: CSSProperties['width'];
        height?: CSSProperties['width'];
        minHeight?: CSSProperties['height'];
        maxHeight?: CSSProperties['height'];
        maxWidth?: CSSProperties['maxWidth'];
        minWidth?: CSSProperties['maxWidth'];
        position?: 'relative' | 'absolute' | 'static' | 'fixed';
        justify?:
          | 'flex-start'
          | 'stretch'
          | 'flex-end'
          | 'center'
          | 'space-between'
          | 'space-around';
        align?: 'flex-start' | 'stretch' | 'flex-end' | 'center';
        gap?: Gutter;
        flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
      }
    | boolean;
  flexItem?: {
    order?: uint;
    alignSelf?: 'flex-start' | 'stretch' | 'flex-end' | 'center';
    marginBottom?: number | 'auto';
    marginTop?: number | 'auto';
    marginLeft?: number | 'auto';
    marginRight?: number | 'auto';
    width?: CSSProperties['width'];
    height?: CSSProperties['width'];
    minHeight?: CSSProperties['height'];
    maxHeight?: CSSProperties['height'];
    maxWidth?: CSSProperties['maxWidth'];
    minWidth?: CSSProperties['maxWidth'];
    flex?: number;
  };
}

export function withFlex<P extends WithStyles>(
  Component: FC<P> | ComponentClass<P>,
): FC<P & WithFlex> {
  // eslint-disable-next-line react/display-name
  return ({ flex, flexItem, style, className, ...props }: P & WithFlex) => {
    const flexMeasuringStyles: CSSProperties = useMemo(() => {
      if (!flex || typeof flex === 'boolean') {
        return {};
      }
      return {
        minWidth: flex.minWidth,
        maxWidth: flex.maxWidth,
        minHeight: flex.minHeight,
        maxHeight: flex.maxHeight,
        width: flex.width,
        height: flex.height,
        gap: flex.gap ? getGutter(flex.gap) : undefined,
      };
    }, [flex]);

    const flexItemMeasuringStyles: CSSProperties = useMemo(() => {
      if (!flexItem) {
        return {};
      }
      return {
        flex: flexItem.flex,
        marginBottom:
          typeof flexItem.marginBottom === 'number'
            ? getGutter(flexItem.marginBottom)
            : flexItem.marginBottom,
        marginTop:
          typeof flexItem.marginTop === 'number'
            ? getGutter(flexItem.marginTop)
            : flexItem.marginTop,
        marginLeft:
          typeof flexItem.marginLeft === 'number'
            ? getGutter(flexItem.marginLeft)
            : flexItem.marginLeft,
        marginRight:
          typeof flexItem.marginRight === 'number'
            ? getGutter(flexItem.marginRight)
            : flexItem.marginRight,
        order: flexItem.order,
        minWidth: flexItem.minWidth,
        maxWidth: flexItem.maxWidth,
        minHeight: flexItem.minHeight,
        maxHeight: flexItem.maxHeight,
        width: flexItem.width,
        height: flexItem.height,
      };
    }, [flexItem]);

    const flexItemClassNames = useMemo(() => {
      if (flexItem) {
        return flexItemCls({
          alignSelf: flexItem.alignSelf,
        });
      }
      return undefined;
    }, [flexItem]);

    const flexClassNames = useMemo(() => {
      if (typeof flex === 'boolean') {
        return flexCls({
          display: 'flex',
          direction: 'row',
          align: 'flex-start',
          justify: 'flex-start',
        });
      } else if (flex) {
        return flexCls({
          display: flex.inline ? 'inlineFlex' : 'flex',
          direction: flex.col ? 'col' : 'row',
          align: flex.align || 'flex-start',
          justify: flex.justify || 'flex-start',
          flexWrap:
            flex.flexWrap === 'wrap'
              ? 'wrap'
              : flex.flexWrap === 'nowrap'
                ? 'noWrap'
                : undefined,
        });
      }
      return undefined;
    }, [flex]);

    return (
      //@ts-expect-error-ignore
      <Component
        {...props}
        className={clsx([className, flexClassNames, flexItemClassNames])}
        style={{
          ...flexMeasuringStyles,
          ...flexItemMeasuringStyles,
          ...style,
        }}
      />
    );
  };
}
