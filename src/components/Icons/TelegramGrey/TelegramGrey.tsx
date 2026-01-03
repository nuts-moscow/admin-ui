import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const TelegramGrey: FC<SimpleIconProps> = ({
  width,
  activeColor,
  height,
  size,
}) => {
  return (
    <Icon
      activeColor={activeColor}
      darkIcon="/icons/social/telegram-dark.svg"
      lightIcon="/icons/social/telegram-grey.svg"
      width={width || size}
      height={height || size}
    />
  );
};
