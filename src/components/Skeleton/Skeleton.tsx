import React, { CSSProperties } from 'react';
import { uint } from '@/core/types/types';
import { shimmerCls, skeletonCls } from '@/components/Skeleton/Skeleton.css';

interface SkeletonProps {
  width: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: uint;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius,
}) => {
  return (
    <div
      className={skeletonCls}
      style={{ width, height, borderRadius: radius }}
    >
      <div className={shimmerCls} style={{ height }}></div>
    </div>
  );
};
