import { keyframes, style } from '@vanilla-extract/css';

const shimMove = keyframes({
  '0%': {
    transform: 'translateX(0px)',
  },
  '100%': {
    transform: 'translateX(300px)',
  },
});

export const shimmerCls = style({
  animation: `${shimMove} 0.75s infinite`,
  background: `linear-gradient(
    90deg,
    rgba(190, 190, 190, 0.25) 0%,
    rgba(190, 190, 190, 0.37) 25%,
    rgba(129, 129, 129, 0.63) 50%,
    rgba(190, 190, 190, 0.37) 75%,
    rgba(190, 190, 190, 0.25) 100%
)`,
  width: 100,
  filter: 'blur(15px)',
  transform: 'translateX(-300px)',
});

export const skeletonCls = style({
  background: 'rgba(190, 190, 190, 0.25)',
  overflow: 'hidden',
  borderRadius: 12,
  display: 'inline-block',
  height: '100%',
});
