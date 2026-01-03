import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const LightningGray: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/lightning-gray.svg"
      lightIcon="/icons/lightning-gray.svg"
      width={width || size}
      height={height || size}
    />
  );
};
