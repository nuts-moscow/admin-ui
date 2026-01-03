import { recipe } from '@vanilla-extract/recipes';
import { getGutter } from '@/core/utils/style/gutter';

export const checkboxCls = recipe({
  base: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '2px',
    gap: getGutter(2),
    transition: 'all 0.3s ease-in-out',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 0 0 var(--border-color)',
    color: 'var(--background-primary)',
    borderRadius: 'var(--radius-8)',
    cursor: 'pointer',
    background: 'transparent',
    width: getGutter(4),
    height: getGutter(4),
    selectors: {
      '&[data-state="checked"], &[data-state="indeterminate"]': {
        backgroundColor: 'var(--color-primary)',
      },
      '&:focus-visible': {
        outline: 'none',
      },
    },
    ':disabled': {
      cursor: 'not-allowed',
      border: '1px solid var(--text-grey)',
      boxShadow: '0 2px 0 0 var(--text-grey)',
      color: 'var(--text-grey)',
    },
  },
  variants: {
    size: {
      small: {
        height: getGutter(3.5),
        width: getGutter(3.5),
      },
      medium: {
        height: getGutter(4),
        width: getGutter(4),
      },
      large: {
        height: getGutter(6),
        width: getGutter(6),
      },
      xLarge: {
        height: getGutter(8),
        width: getGutter(8),
      },
    },
  },
});

export const checkboxIconCls = recipe({
  base: { display: 'blocks', height: getGutter(2.5), width: getGutter(2.5) },
  variants: {
    size: {
      small: {
        height: getGutter(2),
        width: getGutter(2),
      },
      medium: {
        height: getGutter(2.5),
        width: getGutter(2.5),
      },
      large: {
        height: getGutter(3),
        width: getGutter(3),
      },
      xLarge: {
        height: getGutter(3.5),
        width: getGutter(3.5),
      },
    },
  },
});
