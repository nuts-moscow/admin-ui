import { recipe } from '@vanilla-extract/recipes';

export const chevronCls = recipe({
  base: {
    transition: 'transform 0.5s',
  },
  variants: {
    state: {
      opened: {
        transform: 'rotate(0deg)',
      },
      closed: {
        transform: 'rotate(180deg)',
      },
    },
  },
});
