import { style } from '@vanilla-extract/css';

export const modalCloseButtonCls = style({
  position: 'absolute',
  top: 12,
  right: 12,
  cursor: 'pointer',
  padding: 12,
  border: '1px solid var(--border-color)',
  boxShadow: '0 2px 0 0 var(--border-color)',
  borderRadius: 6,
});
