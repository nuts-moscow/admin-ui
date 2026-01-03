import { BASE_GUTTER } from './constants';
import { Dictionary, uint } from '@/core/types/types';

export const getRowHeight = (
  index: number,
  itemCount: uint,
  selectedItems: uint[],
  itemHeight: number,
  expandHeight: number,
  groups: Dictionary<{ height: number }>,
  gap = 0,
): number => {
  if (groups[index]) {
    return groups[index].height + gap * BASE_GUTTER;
  }

  const isItemSelected = selectedItems.includes(index);

  if (index === itemCount - 1) {
    return isItemSelected ? itemHeight + expandHeight : itemHeight;
  }

  return (
    (isItemSelected ? itemHeight + expandHeight : itemHeight) +
    gap * BASE_GUTTER
  );
};
