import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Completed: FC<SimpleIconProps> = ({
  width,
  height,
  size,
  activeColor,
}) => {
  return (
    <Icon
      darkIcon="icons/completed-dark.svg"
      lightIcon="icons/completed.svg"
      activeColor={activeColor}
      width={width || size}
      height={height || size}
    />
  );
};
