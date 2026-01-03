import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const TwitterGrey: FC<SimpleIconProps> = ({
  width,
  activeColor,
  height,
  size,
}) => {
  return (
    <Icon
      activeColor={activeColor}
      darkIcon="/icons/social/x-dark.svg"
      lightIcon="/icons/social/x-grey.svg"
      width={width || size}
      height={height || size}
    />
  );
};
