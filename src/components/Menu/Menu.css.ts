import { style } from '@vanilla-extract/css';

export const menuTriggerCls = style({
  display: 'inline-block',
});

export const menuContentCls = style({
  zIndex: 50,
  minWidth: 236,
  border: '1px solid var(--splash-secondary-color)',
  background: 'var(--splash-outline-color)',
  overflow: 'hidden',
  borderRadius: 'var(--radius-12)',
});
