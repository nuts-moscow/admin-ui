import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Telegram: FC<SimpleIconProps> = ({
  width,
  activeColor,
  height,
  size,
}) => {
  return (
    <Icon
      activeColor={activeColor}
      darkIcon="/icons/social/telegram-dark.svg"
      lightIcon="/icons/social/telegram.svg"
      width={width || size}
      height={height || size}
    />
  );
};
