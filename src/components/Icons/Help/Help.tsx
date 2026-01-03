import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Help: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/help-dark.svg"
      lightIcon="/icons/help.svg"
      width={width || size}
      height={height || size}
    />
  );
};
