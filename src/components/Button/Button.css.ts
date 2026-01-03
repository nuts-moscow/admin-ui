import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { calc } from '@vanilla-extract/css-utils';

const loaderKf = keyframes({
  from: {
    rotate: '0',
  },
  to: {
    rotate: '360deg',
  },
});

export const buttonLoaderCls = style({
  animation: `${loaderKf} 1.2s infinite ease-in-out`,
});

export const buttonCls = recipe({
  base: {
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 0 0 var(--border-color)',
    cursor: 'pointer',
    display: 'inline-flex',
    gap: 'var(--base-gutter)',
    justifyContent: 'center',
    outline: 'none',
    textWrap: 'nowrap',
    transition: 'all .2s',
    willChange: 'background-color, color, border-color, width',
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  variants: {
    size: {
      xxSmall: {
        borderRadius: 6,
        font: 'var(--font-xx-small)',
        fontFamily: 'var(--titan-font-family)',
        height: 28,
        padding: `0 ${calc.multiply('var(--base-gutter)', 3)}`,
      },
      xSmall: {
        borderRadius: 12,
        font: 'var(--font-x-small)',
        fontFamily: 'var(--titan-font-family)',
        height: 32,
        padding: `0 ${calc.multiply('var(--base-gutter)', 3)}`,
      },
      small: {
        borderRadius: 12,
        font: 'var(--font-small)',
        fontFamily: 'var(--titan-font-family)',
        height: 40,
        padding: `0 ${calc.multiply('var(--base-gutter)', 2)}`,
      },
      medium: {
        borderRadius: 12,
        font: 'var(--font-small)',
        fontFamily: 'var(--titan-font-family)',
        height: 46,
        padding: `0 ${calc.multiply('var(--base-gutter)', 4)}`,
      },
      large: {
        borderRadius: 12,
        font: 'var(--font-small)',
        fontFamily: 'var(--titan-font-family)',
        height: 54,
        padding: `0 ${calc.multiply('var(--base-gutter)', 4)}`,
      },
    },
    primary: {
      active: {
        background: 'var(--background-green-button-color)',
        color: 'var(--text-primary-button)',
        ':hover': {
          background: 'var(--background-green-button-hover-color)',
          boxShadow: '0 -2px 0 0 var(--border-color)',
        },
        ':disabled': {
          background: 'var(--background-green-button-disabled-color)',
          color: 'var(--text-primary-button)',
          boxShadow: '0 2px 0 0 var(--background-button-disabled)',
          borderColor: 'var(--background-button-disabled)',
        },
      },
      loading: {
        background: 'var(--background-green-button-color)',
        color: 'var(--text-primary-button)',
        ':disabled': {
          background: 'var(--background-green-button-color)',
        },
      },
    },
    secondary: {
      active: {
        background: 'var(--background-white-button-color)',
        color: 'var(--text-primary)',
        ':hover': {
          boxShadow: '0 -2px 0 0 var(--border-color)',
          backgroundColor: 'var(--background-white-button-hover-color)',
        },
        ':disabled': {
          boxShadow: '0 2px 0 0 var(--text-button-secondary-disable)',
          background: 'var(--background-white-button-disable-color)',
          color: 'var(--background-button-disabled)',
          borderColor: 'var(--background-button-disabled)',
        },
      },
      loading: {
        background: 'var(--background-white-button-color)',
        color: 'var(--text-primary)',
        ':disabled': {
          background: 'var(--background-white-button-color)',
        },
      },
    },
    outline: {
      true: {
        background: 'transparent',
        color: 'var(--text-outline)',
        border: 'none',
        boxShadow: 'none',
        height: '100%',
        fontFamily: 'var(--primary-font-family)',
        fontWeight: 700,

        ':hover': {
          color: 'var(--text-primary)',
        },
      },
    },
    outlineError: {
      true: {
        background: 'transparent',
        color: 'var(--text-error)',
        borderColor: 'var(--background-red-button-color)',
        boxShadow: '0 2px 0 0 var(--background-red-button-color)',

        ':hover': {
          boxShadow: '0 -2px 0 0 var(--background-red-button-color)',
        },
      },
    },
    error: {
      true: {
        background: 'var(--background-red-button-color)',
        color: 'var(--text-primary-button)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 2px 0 0 var(--border-color)',

        ':hover': {
          boxShadow: '0 -2px 0 0 var(--border-color)',
        },
      },
    },
    accent: {
      active: {
        background: 'var(--background-purple-button-color)',
        color: 'var(--text-accent-button)',
        ':hover': {
          boxShadow: '0 -2px 0 0 var(--border-color)',
          backgroundColor: 'var(--background-purple-button-hover-color)',
        },
        ':disabled': {
          boxShadow: '0 2px 0 0 var(--text-button-secondary-disable)',
          background: 'var(--background-white-button-disable-color)',
          color: 'var(--text-button-secondary-disable)',
          borderColor: 'var(--background-button-disabled)',
        },
      },
      loading: {
        background: 'var(--background-purple-button-color)',
        color: 'var(--text-accent-button)',
        ':disabled': {
          background: 'var(--background-purple-button-color)',
        },
      },
    },
    link: {
      true: {
        height: 'auto',
        padding: '0',
        border: 'none',
        background: 'transparent',
        fontFamily: 'var(--primary-font-family)',
        fontWeight: 700,
        width: 'auto',
        boxShadow: 'none',
        color: 'var(--background-purple-button-color)',
        ':hover': {
          color: 'var(--background-purple-button-color)',
        },
        ':active': {
          color: 'var(--background-purple-button-color)',
        },
        ':focus-visible': {
          color: 'var(--background-purple-button-color)',
        },
      },
    },
    ghost: {
      active: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: 'none',
        boxShadow: 'none',
        ':hover': {
          color: 'var(--text-secondary)',
        },
        ':active': {
          color: 'var(--text-secondary)',
        },
        ':focus-visible': {
          color: 'var(--text-secondary)',
        },
        ':disabled': {
          background: 'transparent',
          color: 'var(--text-primary-disabled)',
        },
      },
      loading: {
        background: 'transparent',
      },
    },
  },
});
