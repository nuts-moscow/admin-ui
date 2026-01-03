import { style } from '@vanilla-extract/css';
import { SIZES } from '@/core/states/device/Sizes';

export const controlErrorTextCls = style({
  fontSize: 12,
  '@media': {
    [`(min-width: ${SIZES.m}px)`]: {
      fontSize: 14,
    },
  },
});
