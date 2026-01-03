import { recipe } from '@vanilla-extract/recipes';

export const tagCls = recipe({
  base: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'calc(var(--base-gutter))',
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontWeight: 500,
    fontFamily: 'var(--primary-font-family)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  variants: {
    size: {
      small: {
        padding: '0 calc(var(--base-gutter) * 1.5)',
        height: 24,
        borderRadius: 'var(--radius-8)',
        fontSize: 'var(--font-size-small)',
        lineHeight: '20px',
      },
      medium: {
        padding: '0 calc(var(--base-gutter) * 2)',
        height: 28,
        borderRadius: 'var(--radius-8)',
        fontSize: 'var(--font-size-small)',
        lineHeight: '20px',
      },
      large: {
        padding: '0 calc(var(--base-gutter) * 3)',
        height: 36,
        borderRadius: 'var(--radius-12)',
        fontSize: 'var(--font-size-small)',
        lineHeight: 20,
      },
    },
    type: {
      success: {
        backgroundColor: 'var(--background-tag-success)',
        color: 'var(--text-success)',
      },
      destructive: {
        backgroundColor: 'var(--background-tag-destructive)',
        color: 'var(--text-error)',
      },
      accent: {
        backgroundColor: 'var(--background-tag-accent)',
        color: 'var(--text-accent)',
      },
      warning: {
        backgroundColor: 'var(--background-tag-warning)',
        color: 'var(--text-warning)',
      },
    },
  },
});
