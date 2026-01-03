import { forwardRef } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export interface InfoProps extends SimpleIconProps {
  readonly success?: boolean;
  readonly warning?: boolean;
}

// eslint-disable-next-line react/display-name
export const Info = forwardRef<HTMLImageElement, InfoProps>(
  ({ width, height, size, success, warning, ...other }, ref) => {
    return (
      <Icon
        ref={ref}
        darkIcon={
          success
            ? '/icons/info-success.svg'
            : warning
              ? '/icons/info-warning.svg'
              : '/icons/info-dark.svg'
        }
        lightIcon={
          success
            ? '/icons/info-success.svg'
            : warning
              ? '/icons/info-warning.svg'
              : '/icons/info.svg'
        }
        width={width || size}
        height={height || size}
        {...other}
      />
    );
  },
);
