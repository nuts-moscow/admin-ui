import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

export const tooltipArrowCls = style({
  fill: 'var(--background-control-menu-color)',
  width: 22,
  height: 12,
});

export const tooltipIconQuestionCls = style({
  color: 'var(--text-primary)',
});

export const tooltipTriggerCls = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
});

export const tooltipContentCls = recipe({
  base: {
    zIndex: 1000,
    overflow: 'hidden',
    borderRadius: 'var(--radius-12)',
    backgroundColor: 'var(--background-control-menu-color)',
    color: 'var(--text-primary)',
    font: 'var(--font-x-small)',
    fontFamily: 'var(--primary-font-family)',
  },
  variants: {
    animationOn: {
      true: {
        selectors: {
          [`&[data-state='delayed-open']`]: {
            animation: `${fadeIn} 200ms`,
            animationFillMode: 'forwards !important',
          },
        },
      },
    },
  },
});
