import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const ExternalLink: FC<SimpleIconProps & { grey?: boolean }> = ({
  width,
  height,
  size,
  grey,
}) => {
  return (
    <Icon
      darkIcon={
        grey ? '/icons/external-link-grey.svg' : '/icons/external-link-dark.svg'
      }
      lightIcon={
        grey ? '/icons/external-link-grey.svg' : '/icons/external-link.svg'
      }
      width={width || size}
      height={height || size}
    />
  );
};
