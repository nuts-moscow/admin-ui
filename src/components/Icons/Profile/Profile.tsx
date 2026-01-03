import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Profile: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/profile-dark.svg"
      lightIcon="/icons/profile.svg"
      width={width || size}
      height={height || size}
    />
  );
};
