import { large, medium, small } from '@/core/utils/style/UiKitSizes';
import { WithChildren } from '@/core/utils/style/WithChildren';
import { withFlex } from '@/components/Flex/Flex';
import { CSSProperties, forwardRef } from 'react';
import { clsx } from 'clsx';
import { tagCls } from '@/components/Tag/Tag.css';

export type TagType = 'success' | 'destructive' | 'accent' | 'warning';
export type GeometryTape = 'rounded' | 'skewed' | 'half-skewed';

export interface TagProps extends WithChildren {
  readonly size?: small | medium | large;
  readonly type?: TagType;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export const Tag = withFlex(
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLDivElement, TagProps>(
    ({ children, className, style, type = 'accent', size }: TagProps, ref) => {
      return (
        <div
          style={style}
          className={clsx(
            className,
            tagCls({
              size: size,
              type: type,
            }),
          )}
          ref={ref}
        >
          {children}
        </div>
      );
    },
  ),
);
