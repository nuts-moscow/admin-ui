import { recipe } from '@vanilla-extract/recipes';
import { getGutter } from '@/core/utils/style/gutter';

export const toggleGroupCls = recipe({
  base: {
    display: 'flex',
    background: 'transparent',
    height: 54,
  },
  variants: {
    size: {
      xxSmall: {
        height: 28,
      },
      xSmall: {
        height: 32,
      },
      small: {
        height: 36,
      },
      medium: {
        height: 40,
      },
      large: {
        height: 44,
      },
      xLarge: {
        height: 48,
      },
      xxLarge: {
        height: 54,
      },
    },
    itemsType: {
      tab: {},
      buttonGroup: {
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 0 0 var(--border-color)',
        borderRadius: 'var(--radius-12)',
        padding: getGutter([1, 1]),
        gap: getGutter(1),
      },
      button: {},
    },
    borderAll: {
      true: {
        border: '1px solid var(--border-color)',
      },
    },
    borderLeft: {
      true: {
        borderLeft: '1px solid var(--border-color)',
      },
    },
    borderBottom: {
      true: {
        borderBottom: '1px solid var(--border-color)',
      },
    },
    borderRight: {
      true: {
        borderRight: '1px solid var(--border-color)',
      },
    },
    borderTop: {
      true: {
        borderTop: '1px solid var(--border-color)',
      },
    },
  },
});
