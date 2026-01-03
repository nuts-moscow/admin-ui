import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Upload: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/upload-image-dark.svg"
      lightIcon="/icons/upload-image.svg"
      width={width || size}
      height={height || size}
    />
  );
};
