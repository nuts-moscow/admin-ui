import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const HeartOutlined: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/heart-outlined-grey.svg"
      lightIcon="/icons/heart-outlined-grey.svg"
      width={width || size}
      height={height || size}
    />
  );
};
