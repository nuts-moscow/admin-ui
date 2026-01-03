import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const DeadSmile: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/dead-smile-dark.svg"
      lightIcon="/icons/dead-smile.svg"
      width={width || size}
      height={height || size}
    />
  );
};
