import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Ban: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/ban-dark.svg"
      lightIcon="/icons/ban.svg"
      width={width || size}
      height={height || size}
    />
  );
};
