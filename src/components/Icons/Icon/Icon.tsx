import { forwardRef } from "react";
import Image from "next/image";

interface IconProps {
  readonly darkIcon: string;
  readonly lightIcon: string;
  readonly activeColor?: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  readonly styles?: string;
}

export interface SimpleIconProps {
  readonly activeColor?: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly size?: number;
  readonly className?: string;
  readonly styles?: string;
}

export const Icon = forwardRef<HTMLImageElement, IconProps>(
  ({ lightIcon, width, height, ...other }, ref) => {
    return (
      <Image
        ref={ref}
        src={lightIcon}
        alt=""
        width={width}
        height={height}
        {...other}
      />
    );
  }
);
Icon.displayName = "Icon";
