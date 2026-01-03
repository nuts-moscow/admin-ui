import { sum } from 'ramda';
import { CSSProperties } from 'react';
import { Dictionary, uint } from '@/core/types/types';
import { BASE_GUTTER } from '@/components/List/utils/constants';
import { normalizeMeasure } from '@/components/List/utils/normalizeMeasure';

export const getHeight = (
  height: CSSProperties['height'],
  maxHeight: CSSProperties['height'],
  expandHeight: number,
  itemCount: uint,
  selectedItemsCount: uint,
  itemHeight: number,
  groups: Dictionary<{ height: number }>,
  gap = 0,
): CSSProperties['height'] => {
  if (!!height) {
    return '100%';
  }
  const groupsHeights = Object.values(groups).map((g) => g.height);
  const estimatedHeight =
    sum(groupsHeights) +
    groupsHeights.length * BASE_GUTTER * gap +
    (itemHeight + BASE_GUTTER * gap) *
      (itemCount - selectedItemsCount - groupsHeights.length) +
    (itemHeight + expandHeight + BASE_GUTTER * gap) * selectedItemsCount -
    BASE_GUTTER * gap;

  if (!!maxHeight) {
    return `min(${normalizeMeasure(maxHeight)}, ${normalizeMeasure(
      estimatedHeight,
    )})`;
  }
  return undefined;
};
