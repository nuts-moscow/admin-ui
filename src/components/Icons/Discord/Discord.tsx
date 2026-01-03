import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const Discord: FC<SimpleIconProps> = ({
  activeColor,
  width,
  height,
  size,
}) => {
  return (
    <Icon
      activeColor={activeColor}
      darkIcon="/icons/social/discord-dark.svg"
      lightIcon="/icons/social/discord.svg"
      width={width || size}
      height={height || size}
    />
  );
};
