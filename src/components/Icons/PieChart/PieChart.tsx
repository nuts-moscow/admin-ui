import { FC } from 'react';
import { Icon, SimpleIconProps } from '@/components/Icons/Icon/Icon';

export const PieChart: FC<SimpleIconProps> = ({
  width,
  height,
  size,
  activeColor,
}) => {
  return (
    <Icon
      darkIcon="/icons/pie-chart-dark.svg"
      lightIcon="/icons/pie-chart.svg"
      activeColor={activeColor}
      width={size || width || 20}
      height={size || height || 20}
    />
  );
};
