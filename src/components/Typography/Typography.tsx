import React, {
  CSSProperties,
  DetailedHTMLProps,
  FC,
  HTMLAttributes,
  useMemo,
} from 'react';
import { withFlex } from '@/components/Flex/Flex';
import {
  large,
  medium,
  small,
  xLarge,
  xSmall,
  xxSmall,
  xxxSmall,
} from '@/core/utils/style/UiKitSizes';
import {
  typographyTextCls,
  typographyTitleCls,
} from '@/components/Typography/Typography.css';
import { clsx } from 'clsx';

export interface TextProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  readonly monospaced?: boolean;
  readonly titan?: boolean;
  readonly bold?: boolean;
  readonly extraBold?: boolean;
  readonly light?: boolean;
  readonly size?: xxxSmall | xxSmall | xSmall | small | medium | large | xLarge;
  readonly type?:
    | 'primary'
    | 'secondary'
    | 'buy'
    | 'brand'
    | 'sell'
    | 'error'
    | 'warning'
    | 'link'
    | 'tertiary'
    | 'grey'
    | 'sky'
    | 'disabled'
    | 'outline'
    | 'accent';
  readonly textAlign?: 'left' | 'right' | 'center' | 'justify';
  readonly ellipsisStarts?: CSSProperties['maxWidth'];
  readonly letter?: CSSProperties['letterSpacing'];
}

const Text: FC<TextProps> = ({
  children,
  className,
  ellipsisStarts,
  textAlign,
  type,
  size,
  bold,
  extraBold,
  light,
  titan,
  style,
  letter,
  ...other
}) => {
  const textStyle = useMemo(() => {
    let style: CSSProperties = {};

    if (ellipsisStarts) {
      style.maxWidth = ellipsisStarts;
    }
    if (letter) {
      style.letterSpacing = letter;
    }

    return style;
  }, [ellipsisStarts, letter]);

  return (
    <span
      className={clsx(
        className,
        typographyTextCls({
          ellipsisStarts: !!ellipsisStarts,
          align: textAlign || 'left',
          type: type || 'primary',
          size: size || 'small',
          weight: light
            ? 'light'
            : bold
              ? 'bold'
              : extraBold
                ? 'extraBold'
                : undefined,
          titan: titan,
          primary: !titan,
        }),
      )}
      style={{ ...textStyle, ...style }}
      {...other}
    >
      {children}
    </span>
  );
};

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
  readonly type?:
    | 'primary'
    | 'secondary'
    | 'buy'
    | 'brand'
    | 'link'
    | 'tertiary'
    | 'sell'
    | 'warning'
    | 'grey'
    | 'sky'
    | 'inherit'
    | 'disabled'
    | 'outline';
  readonly bold?: boolean;
  readonly textAlign?: 'left' | 'right' | 'center' | 'justify';
  readonly letter?: CSSProperties['letterSpacing'];
}
// letter-spacing: ${({ letter }) =>
// letter ? normalizeMeasure(letter) : undefined};
const Title: FC<TitleProps> = ({
  children,
  level,
  textAlign,
  bold,
  style,
  className,
  type,
  letter,
  ...other
}) => {
  return (
    <>
      {level === 1 && (
        <h1
          className={clsx(
            className,
            typographyTitleCls({
              color: type || 'primary',
              level: 1,
              align: textAlign || 'left',
              bold,
            }),
          )}
          style={{ letterSpacing: letter, ...style }}
          {...other}
        >
          {children}
        </h1>
      )}
      {level === 2 && (
        <h2
          className={clsx(
            className,
            typographyTitleCls({
              color: type || 'primary',
              level: 2,
              align: textAlign || 'left',
              bold,
            }),
          )}
          style={{ letterSpacing: letter, ...style }}
          {...other}
        >
          {children}
        </h2>
      )}
      {level === 3 && (
        <h3
          className={clsx(
            className,
            typographyTitleCls({
              color: type || 'primary',
              level: 3,
              align: textAlign || 'left',
              bold,
            }),
          )}
          style={{ letterSpacing: letter, ...style }}
          {...other}
        >
          {children}
        </h3>
      )}
      {level === 4 && (
        <h4
          className={clsx(
            className,
            typographyTitleCls({
              color: type || 'primary',
              level: 4,
              align: textAlign || 'left',
              bold,
            }),
          )}
          style={{ letterSpacing: letter, ...style }}
          {...other}
        >
          {children}
        </h4>
      )}
      {level === 5 && (
        <h5
          className={clsx(
            className,
            typographyTitleCls({
              color: type || 'primary',
              level: 5,
              align: textAlign || 'left',
              bold,
            }),
          )}
          style={{ letterSpacing: letter, ...style }}
          {...other}
        >
          {children}
        </h5>
      )}
      {level === 6 && (
        <h6
          className={clsx(
            className,
            typographyTitleCls({
              color: type || 'primary',
              level: 6,
              align: textAlign || 'left',
              bold,
            }),
          )}
          style={{ letterSpacing: letter, ...style }}
          {...other}
        >
          {children}
        </h6>
      )}
    </>
  );
};

export const Typography = { Text: withFlex(Text), Title: withFlex(Title) };
