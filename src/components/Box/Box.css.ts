import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { getGutter } from '@/core/utils/style/gutter';

export const boxCls = recipe({
  base: {
    transition: 'background-color .2s',
  },
  variants: {
    type: {
      primary: {
        background: 'var(--background-primary)',
      },
    },
    borderAll: {
      true: {
        border: '1px solid',
      },
    },
    relative: {
      true: {
        position: 'relative',
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
    borderLeft: {
      true: {
        borderLeft: '1px solid',
      },
    },
    borderTop: {
      true: {
        borderTop: '1px solid',
      },
    },
    borderColor: {
      secondary: {
        borderColor: 'var(--border-color-table)',
        boxShadow: '0 2px 0 0 var(--border-color-table)',
      },
      secondaryNoShadow: {
        borderColor: 'var(--border-color-table)',
      },
      primary: {
        borderColor: 'var(--border-color)',
        boxShadow: '0 2px 0 0 var(--border-color)',
      },
      primaryNoShadow: {
        borderColor: 'var(--border-color)',
      },
    },
    borderRadius: {
      s: {
        borderRadius: 'var(--radius-6)',
      },
      xl: {
        borderRadius: 'var(--radius-12)',
      },
    },
    clickable: {
      true: {
        cursor: 'pointer',
        ':hover': {
          background: 'var(--background-token-card-hover)',
        },
      },
    },
  },
});

export const boxTabsContainerCls = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const boxTabsWrapperCls = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    marginBottom: getGutter(4),
  },
  variants: {
    overflow: {
      true: {
        overflowX: 'auto',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        paddingBottom: getGutter(0.5),
      },
    },
  },
});

export const boxBadgeCls = style({
  position: 'absolute',
  top: '-12.5px',
  right: '-12.5px',
  zIndex: 3,
});

export const boxIconCls = style({
  display: 'flex',
  gap: getGutter(1.5),
  justifyContent: 'center',
  alignItems: 'center',
});
export const boxExtraCls = style({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
  height: '100%',
  flexDirection: 'row',
});

export const boxActiveTabCls = style({
  display: 'flex',
  flex: 1,
  minHeight: 1,
  width: '100%',
  height: '100%',
});
