import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Frame: FC<SimpleIconProps> = ({
  width,
  height,
  size,
  activeColor,
}) => {
  return (
    <Icon
      darkIcon="/icons/frame-dark.svg"
      lightIcon="/icons/frame.svg"
      width={width || size}
      height={height || size}
      activeColor={activeColor}
    />
  );
};
