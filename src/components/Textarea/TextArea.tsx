import {
  FC,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
} from 'react';
import { large, medium, small } from '@/core/utils/style/UiKitSizes';
import { WithFlex, withFlex } from '@/components/Flex/Flex';
import { Box } from '@/components/Box/Box';
import { controlLabelCls } from '@/components/ControlUtils/ControlLabel.css';
import { controlRootCls } from '@/components/ControlUtils/ControlRoot.css';
import { Typography } from '@/components/Typography/Typography';
import { controlErrorTextCls } from '@/components/ControlUtils/ControlErrorText.css';
import {
  sideAdornmentCls,
  TextAreaCls,
} from '@/components/Textarea/TextArea.css';
import { getGutter, Gutter } from '@/core/utils/style/gutter';

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  disabled?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  required?: boolean;
  label?: string;
  size?: small | medium | large;
  border?: boolean;
  borderRadius?: boolean;
  rounded?: boolean;
  padding?: Gutter;
  textAreaRows?: number;
  rightAdornment?: ReactNode;
  leftAdornment?: ReactNode;
  ref?: Ref<HTMLTextAreaElement>;
};

export const TextArea: FC<TextAreaProps & WithFlex> = withFlex(
  ({
    size,
    disabled,
    required,
    error,
    style,
    className,
    errorText,
    label,
    borderRadius,
    rounded,
    rightAdornment,
    leftAdornment,
    padding = [4, 0],
    textAreaRows = 2,
    ref,
    ...other
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const textarea = textareaRef.current;

      if (textarea) {
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };

        textarea.addEventListener('input', adjustHeight);
        adjustHeight();

        return () => {
          textarea.removeEventListener('input', adjustHeight);
        };
      }
    }, [window.innerWidth]);

    const handleFocusInput = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
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
          className={controlRootCls({
            border: !error,
            error,
            borderRadius: rounded ? 'l' : borderRadius ? 'm' : undefined,
            type: 'primary',
            size: size || 'large',
            color: disabled ? 'disabled' : 'active',
          })}
        >
          {leftAdornment && (
            <span
              className={sideAdornmentCls({ side: 'left' })}
              onClick={handleFocusInput}
            >
              {leftAdornment}
            </span>
          )}
          <textarea
            className={TextAreaCls({
              size: size || 'small',
            })}
            rows={textAreaRows}
            ref={ref || textareaRef}
            disabled={disabled}
            style={{
              ...style,
              padding: getGutter(padding as Gutter),
            }}
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
        {error && (
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
