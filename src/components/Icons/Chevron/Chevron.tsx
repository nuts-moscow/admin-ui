import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';
import { chevronCls } from '@/components/Icons/Chevron/Chevron.css';

export const Chevron: FC<SimpleIconProps & { opened: boolean }> = ({
  width,
  height,
  size,
  opened,
}) => {
  return (
    <Icon
      className={chevronCls({
        state: opened ? 'opened' : 'closed',
      })}
      darkIcon="/icons/chevron-up-dark.svg"
      lightIcon="/icons/chevron-up.svg"
      width={width || size}
      height={height || size}
    />
  );
};
