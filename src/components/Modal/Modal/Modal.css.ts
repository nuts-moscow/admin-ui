import { keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const overlayHide = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

export const modalOverlayCls = recipe({
  base: {
    background: 'var(--background-modal-overlay)',
    inset: 0,
    position: 'fixed',
    zIndex: 9999,
  },
  variants: {
    closing: {
      true: {
        animation: `${overlayHide} 300ms`,
        animationFillMode: 'forwards !important',
      },
    },
    opening: {
      true: {
        animation: `${overlayShow} 300ms`,
      },
    },
  },
});
