import { recipe } from '@vanilla-extract/recipes';
import { SIZES } from '@/core/states/device/Sizes';

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

export const inputCls = recipe({
  base: {
    margin: 0,
    padding: '14px 0',
    border: 'none',
    outline: 'none',
    resize: 'none',
    width: '100%',
    font: 'inherit',
    borderRadius: 'var(--radius-6)',
    color: 'var(--text-primary)',
    background: 'none',

    '::placeholder': {
      color: 'var(--text-grey)',
    },
    // selectors: {
    //   '&:disabled > &::placeholder': {
    //     color: 'var(--text-primary-disabled)',
    //   },
    // },
  },
  variants: {
    size: {
      small: {
        fontSize: 'var(--font-size-small)',
      },
      medium: {
        fontSize: 'var(--font-medium-medium)',
      },
      large: {
        fontSize: 'var(--font-medium-medium)',
        '@media': {
          [`(min-width: ${SIZES.m}px)`]: {
            fontSize: 'var(--font-size-small)',
          },
        },
      },
      xLarge: {
        padding: 'calc(var(--base-gutter) * 11) 0',
        fontSize: 'var(--font-medium-medium)',
        '@media': {
          [`(min-width: ${SIZES.m}px)`]: {
            fontSize: 'var(--font-size-small)',
          },
        },
      },
    },
  },
});
