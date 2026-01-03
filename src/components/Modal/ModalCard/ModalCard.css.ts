import { keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { SIZES } from '@/core/states/device/Sizes';

const modalCardShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const modalCardHide = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

export const modalCardCls = recipe({
  base: {
    background: 'var(--background-primary)',
    borderRadius: 'var(--radius-6)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 0 0 var(--border-color)',
    left: '50%',
    padding: 24,
    position: 'fixed',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    overflowY: 'auto',
    '@media': {
      [`(min-width: ${SIZES.m}px)`]: {
        padding: 32,
      },
    },
  },
  variants: {
    closing: {
      true: {
        animation: `${modalCardHide} 300ms`,
        animationFillMode: 'forwards !important',
      },
    },
    opening: {
      true: {
        animation: `${modalCardShow} 300ms`,
      },
    },
  },
});
