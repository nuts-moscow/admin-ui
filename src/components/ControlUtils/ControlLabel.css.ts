import { recipe } from '@vanilla-extract/recipes';
import { SIZES } from '@/core/states/device/Sizes';

export const controlLabelCls = recipe({
  base: {
    font: 'var(--font-small)',
    fontFamily: 'var(--primary-font-family), serif',
    color: 'var(--text-primary)',
    fontSize: 12,
    '@media': {
      [`(min-width: ${SIZES.m}px)`]: {
        fontSize: 14,
      },
    },
  },
  variants: {
    required: {
      true: {
        ':after': {
          content: '*',
          font: 'var(--font-small)',
          color: 'var(--text-error)',
          marginLeft: 2,
        },
      },
    },
  },
});
