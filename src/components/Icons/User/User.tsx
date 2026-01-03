import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const User: FC<SimpleIconProps> = ({
  width,
  activeColor,
  height,
  size,
}) => {
  return (
    <Icon
      darkIcon="/icons/user.svg"
      lightIcon="/icons/user.svg"
      width={width || size}
      activeColor={activeColor}
      height={height || size}
    />
  );
};
