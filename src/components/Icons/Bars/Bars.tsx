import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Bars: FC<SimpleIconProps> = ({
  width,
  height,
  size,
  activeColor,
}) => {
  return (
    <Icon
      darkIcon="/icons/bars-dark.svg"
      lightIcon="/icons/bars.svg"
      activeColor={activeColor}
      width={width || size}
      height={height || size}
    />
  );
};
