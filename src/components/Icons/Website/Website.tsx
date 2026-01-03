import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Website: FC<SimpleIconProps> = ({
  width,
  activeColor,
  height,
  size,
}) => {
  return (
    <Icon
      darkIcon="/icons/social/website-dark.svg"
      lightIcon="/icons/social/website.svg"
      width={width || size}
      activeColor={activeColor}
      height={height || size}
    />
  );
};
