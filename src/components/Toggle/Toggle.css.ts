import { recipe } from '@vanilla-extract/recipes';

export const toggleContainerCls = recipe({
  base: {
    all: 'unset',
    cursor: 'pointer',
    display: 'inline-block',
    backgroundColor: 'var(--background-control-menu-color)',
    position: 'relative',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 10px',
    //   @ts-expect-error-ignore
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
    borderRadius: 'var(--radius-48)',
    selectors: {
      '&[data-state="checked"]': {
        backgroundColor: 'rgba(24, 242, 178, 0.12)',
      },
    },
  },
  variants: {
    size: {
      small: {
        width: 'calc(var(--base-gutter) * 10)',
        height: 'calc(var(--base-gutter) * 5)',
      },
      medium: {
        width: 'calc(var(--base-gutter) * 16)',
        height: 'calc(var(--base-gutter) * 8)',
        '::before': {
          transition: 'all 0.1s',
          position: 'absolute',
          width: 'calc(100% - var(--base-gutter) * 6)',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: '0',
          font: 'var(--font-small)',
          fontFamily: 'var(--primary-font-family)',
          fontWeight: '500',
        },
        selectors: {
          '&[data-state="unchecked"]::before': {
            content: 'Off',
            right: 0,
            color: 'var(--text-primary)',
          },
          '&[data-state="checked"]::before': {
            content: 'On',
            left: 0,
            color: 'var(--text-success)',
          },
        },
      },
    },
  },
});

export const toggleThumbCls = recipe({
  base: {
    display: 'block',
    background: 'url(/thumb.png)',
    backgroundSize: 'cover',
    borderRadius: '50%',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 2px',
    transition: 'transform 100ms ease 0s',
    willChange: 'transform',
    position: 'relative',
  },
  variants: {
    size: {
      small: {
        width: 'calc(var(--base-gutter) * 4)',
        height: 'calc(var(--base-gutter) * 4)',
        transform: 'translateX(calc(var(--base-gutter) * 0.5))',
        selectors: {
          '&[data-state="checked"]': {
            transform: 'translateX(19px)',
          },
        },
      },
      medium: {
        width: 'calc(var(--base-gutter) * 6)',
        height: 'calc(var(--base-gutter) * 6)',
        transform: 'translateX(var(--base-gutter))',
        selectors: {
          '&[data-state="checked"]': {
            transform: 'translateX(36px)',
          },
        },
      },
    },
  },
});
