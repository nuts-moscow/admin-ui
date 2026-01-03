import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Clock: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/clock-dark.svg"
      lightIcon="/icons/clock.svg"
      width={width || size}
      height={height || size}
    />
  );
};
