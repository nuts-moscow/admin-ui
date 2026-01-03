import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const UsaFlag: FC<SimpleIconProps> = ({ width, height, size }) => (
  <Icon
    darkIcon="/icons/usa-flag.svg"
    lightIcon="/icons/usa-flag.svg"
    width={width || size}
    height={height || size}
  />
);
