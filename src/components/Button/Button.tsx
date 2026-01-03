import { withFlex } from '@/components/Flex/Flex';
import {
  ButtonHTMLAttributes,
  cloneElement,
  CSSProperties,
  forwardRef,
  ReactElement,
  useMemo,
} from 'react';
import {
  large,
  medium,
  small,
  xSmall,
  xxSmall,
} from '@/core/utils/style/UiKitSizes';
import { Loader2 } from 'lucide-react';
import { buttonCls, buttonLoaderCls } from '@/components/Button/Button.css';
import { clsx } from 'clsx';
import mergeDeepRight from 'ramda/es/mergeDeepRight';
import { SimpleIconProps } from '@/components/Icons/Icon/Icon';

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  readonly htmlType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  readonly type?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline'
    | 'outline-error'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'sell'
    | 'buy'
    | 'success'
    | 'error'
    | 'warning'
    | 'ghost-destructive'
    | 'accent'
    | 'none';
  readonly loading?: boolean;
  readonly loadingRight?: boolean;
  readonly size?: xxSmall | xSmall | small | medium | large;
  readonly iconLeft?: ReactElement<SimpleIconProps>;
  readonly iconRight?: ReactElement<SimpleIconProps>;
  readonly width?: CSSProperties['width'];
};

export const Button = withFlex(
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        loading,
        loadingRight,
        htmlType,
        iconLeft,
        iconRight,
        children,
        disabled,
        size = 'medium',
        type,
        className,
        width,
        style,
        ...other
      },
      ref,
    ) => {
      const iconSize =
        size === 'small' || size === 'xSmall'
          ? 16
          : size === 'xxSmall'
            ? 12
            : 20;
      const newIconLeft = iconLeft
        ? cloneElement(iconLeft, {
            size: iconSize,
          })
        : iconLeft;
      const newIconRight = iconRight
        ? cloneElement(iconRight, {
            size: iconSize,
          })
        : iconRight;

      const buttonContent = (
        <>
          {loading && !loadingRight ? (
            <Loader2
              className={buttonLoaderCls}
              size={iconSize}
              color={
                type === 'primary'
                  ? 'var(--text-tertiary)'
                  : type === 'outline-error'
                    ? 'var(--text-error)'
                    : 'var(--text-primary)'
              }
            />
          ) : (
            newIconLeft
          )}
          {children && (children || 'Loading...')}
          {loading && !!loadingRight ? (
            <Loader2
              className={buttonLoaderCls}
              size={iconSize}
              color={
                type === 'primary'
                  ? 'var(--text-tertiary)'
                  : type === 'outline-error'
                    ? 'var(--text-error)'
                    : 'var(--text-primary)'
              }
            />
          ) : (
            newIconRight
          )}
        </>
      );

      const hasNoIconOrHasChildren = (!iconLeft && !iconRight) || children;
      const buttonWidth = useMemo(() => {
        if (width) {
          return width;
        }
        if (hasNoIconOrHasChildren) {
          return undefined;
        }
        switch (size) {
          case 'xxSmall':
            return 24;
          case 'xSmall':
            return 32;
          case 'small':
            return 40;
          case 'medium':
            return 46;
          case 'large':
            return 54;
        }
      }, [hasNoIconOrHasChildren, width, size]);

      return (
        <button
          type={htmlType}
          className={clsx(
            className,
            buttonCls({
              size: size || 'medium',
              primary:
                type === 'primary'
                  ? loading
                    ? 'loading'
                    : 'active'
                  : undefined,
              secondary:
                type === 'secondary'
                  ? loading
                    ? 'loading'
                    : 'active'
                  : undefined,
              accent:
                type === 'accent'
                  ? loading
                    ? 'loading'
                    : 'active'
                  : undefined,
              outline: type === 'outline',
              outlineError: type === 'outline-error',
              error: type === 'error',
              link: type === 'link',
              ghost:
                type === 'ghost' ? (loading ? 'loading' : 'active') : undefined,
            }),
          )}
          disabled={disabled || loading}
          style={mergeDeepRight({ width: buttonWidth }, style || {})}
          {...other}
          ref={ref}
        >
          {buttonContent}
        </button>
      );
    },
  ),
);
