import { recipe } from '@vanilla-extract/recipes';

export const flexItemCls = recipe({
  variants: {
    alignSelf: {
      'flex-start': {
        alignSelf: 'flex-start',
      },
      center: {
        alignSelf: 'center',
      },
      'flex-end': {
        alignSelf: 'flex-end',
      },
      stretch: {
        alignSelf: 'stretch',
      },
    },
  },
});

export const flexCls = recipe({
  variants: {
    display: {
      flex: {
        display: 'flex',
      },
      inlineFlex: {
        display: 'inline-flex',
      },
    },
    direction: {
      row: {
        flexDirection: 'row',
      },
      col: {
        flexDirection: 'column',
      },
      rowReverse: {
        flexDirection: 'row-reverse',
      },
      colReverse: {
        flexDirection: 'column-reverse',
      },
    },
    flexWrap: {
      wrap: {
        flexWrap: 'wrap',
      },
      noWrap: {
        flexWrap: 'nowrap',
      },
    },
    justify: {
      'flex-start': {
        justifyContent: 'flex-start',
      },
      center: {
        justifyContent: 'center',
      },
      'flex-end': {
        justifyContent: 'flex-end',
      },
      stretch: {
        justifyContent: 'stretch',
      },
      'space-between': {
        justifyContent: 'space-between',
      },
      'space-around': {
        justifyContent: 'space-around',
      },
    },
    align: {
      'flex-start': {
        alignItems: 'flex-start',
      },
      center: {
        alignItems: 'center',
      },
      'flex-end': {
        alignItems: 'flex-end',
      },
      stretch: {
        alignItems: 'stretch',
      },
    },
  },
});
