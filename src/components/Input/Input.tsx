import { FC, InputHTMLAttributes, ReactNode, Ref, useRef } from 'react';
import { large, medium, small, xLarge } from '@/core/utils/style/UiKitSizes';
import { Box } from '@/components/Box/Box';
import { inputCls, sideAdornmentCls } from '@/components/Input/Input.css';
import { Typography } from '@/components/Typography/Typography';
import { controlLabelCls } from '@/components/ControlUtils/ControlLabel.css';
import { controlRootCls } from '@/components/ControlUtils/ControlRoot.css';
import { controlErrorTextCls } from '@/components/ControlUtils/ControlErrorText.css';
import { WithFlex, withFlex } from '@/components/Flex/Flex';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { clsx } from 'clsx';

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> & {
  disabled?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  required?: boolean;
  label?: string;
  size?: small | medium | large | xLarge;
  rightAdornment?: ReactNode;
  leftAdornment?: ReactNode;
  type?: 'primary' | 'secondary';
  borderRadius?: boolean;
  rounded?: boolean;
  border?: boolean;
  ref?: Ref<HTMLInputElement>;
  rootClassName?: string;
};

export type InputNumericProps = Omit<NumericFormatProps, 'size' | 'type'> &
  InputProps;

const _Input: FC<InputProps & WithFlex> = withFlex(
  ({
    disabled,
    size,
    label,
    required = false,
    error = false,
    errorText,
    rightAdornment,
    leftAdornment,
    type,
    borderRadius,
    rounded,
    border = true,
    className,
    style,
    ref,
    rootClassName,
    ...other
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <Box
        flex={{ col: true, gap: 2, width: '100%' }}
        style={style}
        className={className}
      >
        {label && (
          <label className={controlLabelCls({ required })}>{label}</label>
        )}
        <div
          className={clsx(
            controlRootCls({
              border: border,
              error,
              borderRadius: rounded ? 'l' : borderRadius ? 'm' : undefined,
              type: type || 'primary',
              size: size || 'large',
              color: disabled ? 'disabled' : 'active',
            }),
            rootClassName,
          )}
        >
          {leftAdornment && (
            <span
              className={sideAdornmentCls({ side: 'left' })}
              onClick={handleFocusInput}
            >
              {leftAdornment}
            </span>
          )}
          <input
            className={inputCls({
              size: size || 'small',
            })}
            ref={ref || inputRef}
            disabled={disabled}
            {...other}
          />
          {rightAdornment && (
            <span
              className={sideAdornmentCls({ side: 'right' })}
              onClick={handleFocusInput}
            >
              {rightAdornment}
            </span>
          )}
        </div>
        {error && errorText && (
          <Box
            flex={{ align: 'center' }}
            style={{ columnGap: 'var(--base-gutter)' }}
          >
            <Typography.Text
              size="small"
              className={controlErrorTextCls}
              type="error"
            >
              {errorText}
            </Typography.Text>
          </Box>
        )}
      </Box>
    );
  },
);

const _InputNumeric: FC<InputNumericProps & WithFlex> = withFlex((props) => {
  // @ts-expect-error-ignore
  return <NumericFormat customInput={Input} {...props} />;
});

export const Input = _Input as typeof _Input & {
  Number: typeof _InputNumeric;
};
Input.Number = _InputNumeric;
