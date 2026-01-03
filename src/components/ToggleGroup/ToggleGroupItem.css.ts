import { recipe } from '@vanilla-extract/recipes';
import { getGutter } from '@/core/utils/style/gutter';

export const toggleGroupItemCls = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    whiteSpace: 'nowrap',
    color: 'var(--text-primary)',
    font: 'var(--font-small)',
    fontStyle: 'normal',
    fontFamily: 'var(--primary-font-family), serif',
    fontWeight: '400',
    transition: 'all 0.3s ease-in-out',
    background: 'transparent',
  },
  variants: {
    titan: {
      true: {
        fontFamily: 'var(--titan-font-family), serif',
        fontWeight: 300,
      },
    },
    type: {
      primary: {
        selectors: {
          '&[data-state="on"]': {
            color: 'var(--text-accent-button)',
            background: 'var(--background-purple-button-color)',
          },
        },
      },
      secondary: {
        color: 'var(--text-grey)',
        selectors: {
          '&[data-state="on"]': {
            color: 'var(--text-accent-button)',
            background: 'transparent',
          },
        },
      },
      buy: {
        selectors: {
          '&[data-state="on"]': {
            color: 'var(--text-primary-button)',
            background: 'var(--background-green-button-color)',
          },
        },
      },
      sell: {
        selectors: {
          '&[data-state="on"]': {
            color: 'var(--text-accent-button)',
            background: 'var(--background-red-button-color)',
          },
        },
      },
      ghost: {
        selectors: {
          '&[data-state="checked"]': {
            color: 'var(--text-primary)',
          },
        },
      },
    },
    borderAll: {
      true: {
        border: '1px solid',
      },
    },
    borderLeft: {
      true: {
        borderLeft: '1px solid',
      },
    },
    borderBottom: {
      true: {
        borderBottom: '1px solid',
      },
    },
    borderRight: {
      true: {
        borderRight: '1px solid',
      },
    },
    borderTop: {
      true: {
        borderTop: '1px solid',
      },
    },
    borderColor: {
      primary: {
        borderColor: 'var(--border-color)',
        boxShadowColor: 'var(--border-color)',
      },
      secondary: {
        borderColor: 'var(--border-color-grey)',
        boxShadowColor: 'var(--border-color-grey)',
        selectors: {
          '&[data-state="on"]': {
            border: '1px solid var(--border-color)',
            boxShadowColor: 'var(--border-color)',
          },
        },
      },
    },
    borderRadiusAll: {
      true: {
        borderRadius: 'var(--radius-12)',
      },
    },
    borderRadiusBottomLeft: {
      true: {
        borderBottomLeftRadius: 'var(--radius-10)',
      },
    },
    borderRadiusBottomRight: {
      true: {
        borderBottomRightRadius: 'var(--radius-10)',
      },
    },
    borderRadiusTopRight: {
      true: {
        borderTopRightRadius: 'var(--radius-10)',
      },
    },
    borderRadiusTopLeft: {
      true: {
        borderTopLeftRadius: 'var(--radius-10)',
      },
    },
    fontSize: {
      xxSmall: {
        font: 'var(--font-xx-small)',
        fontFamily: 'var(--titan-font-family), serif',
      },
      xSmall: {
        font: 'var(--font-x-small)',
        fontFamily: 'var(--titan-font-family), serif',
      },
      small: {
        font: 'var(--font-small)',
        fontFamily: 'var(--titan-font-family), serif',
      },
      medium: {
        font: 'var(--font-medium)',
        fontFamily: 'var(--titan-font-family), serif',
      },
      large: {
        font: 'var(--font-large)',
        fontFamily: 'var(--titan-font-family), serif',
      },
      xLarge: {
        font: 'var(--font-x-large)',
        fontFamily: 'var(--titan-font-family), serif',
      },
      xxLarge: {
        font: 'var(--font-xx-large)',
        fontFamily: 'var(--titan-font-family), serif',
      },
    },
    itemsType: {
      tab: {
        border: 'none',
        borderRadius: 'none',
        color: 'var(--text-grey)',
        selectors: {
          '&[data-state="on"]': {
            color: 'var(--text-primary)',
          },
          '&[data-state="on"]::after': {
            content: "''",
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--text-sky)',
            borderTopLeftRadius: '2px',
            borderTopRightRadius: '2px',
            position: 'absolute',
            bottom: 0,
          },
        },
      },
      buttonGroup: {
        borderRadius: 'var(--radius-6)',
      },
      button: {
        padding: `0 ${getGutter(3)}`,
        boxShadow: '0 2px 0 0',
      },
    },
  },
});
