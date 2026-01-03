import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Lightning: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/lightning-dark.svg"
      lightIcon="/icons/lightning.svg"
      width={width || size}
      height={height || size}
    />
  );
};
