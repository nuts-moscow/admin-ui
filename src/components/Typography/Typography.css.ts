import { recipe } from '@vanilla-extract/recipes';

export const typographyTextCls = recipe({
  base: {
    transition: 'color 0.2s',
  },
  variants: {
    ellipsisStarts: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
    align: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
      justify: {
        textAlign: 'justify',
      },
    },
    type: {
      primary: {
        color: 'var(--text-primary)',
      },
      accent: {
        color: 'var(--text-accent)',
      },
      secondary: {
        color: 'var(--text-secondary)',
      },
      tertiary: {
        color: 'var(--text-tertiary)',
      },
      grey: {
        color: 'var(--text-grey)',
      },
      sky: {
        color: 'var(--text-sky)',
      },
      buy: {
        color: 'var(--text-success)',
      },
      sell: {
        color: 'var(--text-error)',
      },
      error: {
        color: 'var(--text-error)',
      },
      warning: {
        color: 'var(--text-warning)',
      },
      outline: {
        color: 'var(--text-outline)',
      },
      brand: {
        color: 'var(--text-brand)',
      },
      link: {
        color: 'var(--text-link)',
      },
      disabled: {
        color: 'var(--text-disabled)',
      },
    },
    size: {
      xxxSmall: {
        font: 'var(--font-xxx-small)',
      },
      xxSmall: {
        font: 'var(--font-xx-small)',
      },
      xSmall: {
        font: 'var(--font-x-small)',
      },
      small: {
        font: 'var(--font-small)',
      },
      medium: {
        font: 'var(--font-medium)',
      },
      large: {
        font: 'var(--font-large)',
      },
      xLarge: {
        font: 'var(--font-x-large)',
      },
    },
    weight: {
      light: {
        fontWeight: 400,
      },
      bold: {
        fontWeight: 'var(--font-weight-bold)',
      },
      extraBold: {
        fontWeight: 900,
      },
    },
    titan: {
      true: {
        fontStyle: 'normal',
        fontFamily: 'var(--titan-font-family), serif',
        fontWeight: 300,
      },
    },
    primary: {
      true: {
        fontStyle: 'normal',
        fontFamily: 'var(--primary-font-family), serif',
      },
    },
  },
});

export const typographyTitleCls = recipe({
  base: {
    margin: 0,
  },
  variants: {
    color: {
      primary: {
        color: 'var(--text-primary)',
      },
      secondary: {
        color: 'var(--text-secondary)',
      },
      grey: {
        color: 'var(--text-grey)',
      },
      sky: {
        color: 'var(--text-sky)',
      },
      buy: {
        color: 'var(--text-buy)',
      },
      sell: {
        color: 'var(--text-sell)',
      },
      warning: {
        color: 'var(--text-warning)',
      },
      outline: {
        color: 'var(--text-outline)',
      },
      brand: {
        color: 'var(--text-brand)',
      },
      link: {
        color: 'var(--text-link)',
      },
      tertiary: {
        color: 'var(--text-tertiary)',
      },
      disabled: {
        color: 'var(--text-primary-disabled)',
      },
      inherit: {},
    },
    level: {
      1: {
        font: 'var(--h1-font)',
        fontFamily: 'var(--titan-font-family)',
      },
      2: {
        font: 'var(--h2-font)',
        fontFamily: 'var(--titan-font-family)',
      },
      3: {
        font: 'var(--h3-font)',
        fontFamily: 'var(--titan-font-family)',
      },
      4: {
        font: 'var(--h4-font)',
        fontFamily: 'var(--titan-font-family)',
      },
      5: {
        font: 'var(--h5-font)',
        fontFamily: 'var(--titan-font-family)',
      },
      6: {
        font: 'var(--h6-font)',
      },
    },
    bold: {
      true: {
        fontWeight: 'var(--font-weight-bold)',
      },
    },
    align: {
      left: {
        textAlign: 'left',
      },
      right: {
        textAlign: 'right',
      },
      center: {
        textAlign: 'center',
      },
      justify: {
        textAlign: 'justify',
      },
    },
  },
});
