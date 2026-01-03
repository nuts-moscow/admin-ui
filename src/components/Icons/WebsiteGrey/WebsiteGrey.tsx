import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const WebsiteGrey: FC<SimpleIconProps> = ({
  width,
  activeColor,
  height,
  size,
}) => {
  return (
    <Icon
      darkIcon="/icons/social/website-dark.svg"
      lightIcon="/icons/social/website-grey.svg"
      width={width || size}
      activeColor={activeColor}
      height={height || size}
    />
  );
};
