import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const AiChip: FC<SimpleIconProps> = ({ width, height, size }) => {
  return (
    <Icon
      darkIcon="/icons/ai-chip-dark.svg"
      lightIcon="/icons/ai-chip.svg"
      width={width || size}
      height={height || size}
    />
  );
};
