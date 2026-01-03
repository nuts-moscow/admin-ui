import { recipe } from '@vanilla-extract/recipes';

export const TextAreaCls = recipe({
  base: {
    margin: 0,
    border: 'none',
    outline: 'none',
    resize: 'none',
    width: '100%',
    font: 'inherit',
    borderRadius: 'var(--radius-6)',
    color: 'var(--text-primary)',
    background: 'none',
    '::placeholder': {
      color: 'var(--text-primary)',
    },
    selectors: {
      '&:disabled::placeholder': {
        color: 'var(--text-primary-disabled)',
      },
    },
  },
  variants: {
    size: {
      small: {
        fontSize: 'var(--font-size-small)',
      },
      medium: {
        fontSize: 'var(--font-size-medium)',
      },
      large: {
        fontSize: 'var(--font-size-large)',
      },
    },
  },
});

export const sideAdornmentCls = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    color: 'inherit',
    whiteSpace: 'nowrap',
  },
  variants: {
    side: {
      left: {
        marginRight: 8,
      },
      right: {
        marginLeft: 8,
      },
    },
  },
});
