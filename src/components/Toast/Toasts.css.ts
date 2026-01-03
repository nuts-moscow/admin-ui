import { keyframes, style } from '@vanilla-extract/css';

const loaderKf = keyframes({
  from: {
    rotate: '0',
  },
  to: {
    rotate: '360deg',
  },
});

export const loaderCls = style({
  animation: `${loaderKf} 1s infinite ease-in-out`,
});

export const closeCls = style({
  cursor: 'pointer',
  position: 'absolute',
  top: '8px',
  right: '8px',
  color: 'var(--text-accent-button)',
});

export const toastContainerCls = style({
  borderRadius: 6,
  border: '1px solid var(--border-color)',
  boxShadow: '0 2px 0 0 var(--border-color)',
  background: 'var(--background-white-button-color)',
  position: 'relative',
});
