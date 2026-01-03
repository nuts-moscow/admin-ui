import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const HeartFilled: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/heart-filled-red.svg"
      lightIcon="/icons/heart-filled-red.svg"
      width={width || size}
      height={height || size}
    />
  );
};
