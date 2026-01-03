import { last } from 'ramda';
import {
  CSSProperties,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AutoSizer, ScrollParams } from 'react-virtualized';
import {
  List as VirtualizedList,
  ListRowRenderer,
} from 'react-virtualized/dist/es/List';

import { Expand } from './common/Expand';
import { ListItem, ListItemFn } from './common/ListItem';
import { ListState } from './common/ListState';
import { ListContext } from './ListContext/ListContext';
import { getHeight } from './utils/getHeight';
import { getRowHeight } from './utils/getRowHeight';
import { Dictionary, uint } from '@/core/types/types';
import { getGutter, Gutter } from '@/core/utils/style/gutter';
import { FastAccessList } from '@/core/utils/models/FastAccessList';

export interface EmptyGroupConfig<T> {
  readonly items: T[];
}

export interface GroupConfig<T> {
  readonly title: ReactNode | ReactNode[] | string;
  readonly height: number;
  readonly items: T[];
}

interface ItemsData<T extends object> {
  readonly items:
    | (T | ReactNode[] | ReactNode | string)[]
    | FastAccessList<T, keyof T>;
  readonly groups: Dictionary<{ name: string; height: number }>;
}

function isGroupConfig<T>(
  group: GroupConfig<T> | EmptyGroupConfig<T>,
): group is GroupConfig<T> {
  return !!(group as any)?.title;
}

function toItemsData<T extends object>(
  items:
    | T[]
    | Dictionary<GroupConfig<T> | EmptyGroupConfig<T>>
    | FastAccessList<T, keyof T>,
): ItemsData<T> {
  if (items instanceof Array || items instanceof FastAccessList) {
    return { items, groups: {} };
  }

  return Object.entries(items).reduce<ItemsData<T>>(
    (itemsData, [key, group]) => {
      if (isGroupConfig(group)) {
        return {
          // @ts-expect-error-ignore
          items: itemsData.items.concat(group.title).concat(group.items),
          groups: {
            ...itemsData.groups,
            [itemsData.items.length]: {
              name: key,
              height: group.height,
            },
          },
        };
      }
      return {
        // @ts-expect-error-ignore
        items: itemsData.items.concat(group.items),
        groups: itemsData.groups,
      };
    },
    { items: [], groups: {} },
  );
}

export interface ListProps<T extends object> {
  readonly reversed?: boolean;
  readonly height?: CSSProperties['height'];
  readonly maxHeight?: CSSProperties['height'];
  readonly gap?: uint;
  readonly padding?: Gutter;
  readonly className?: string;
  // TMP
  readonly scrollClassName?: string;
  readonly style?: CSSProperties;
  readonly overlay?: boolean;
  readonly items:
    | T[]
    | Dictionary<GroupConfig<T> | EmptyGroupConfig<T>>
    | FastAccessList<T, keyof T>;
  readonly itemHeight: ((item: T) => number) | number;
  readonly itemKey: keyof T | ((item: T) => string);
  readonly expand?: Expand;
  readonly keyboardNavigation?: boolean;
  readonly onItemSelect?: (index: number, item: T) => void;
  readonly fadeInDelay?: number;
  readonly onScroll?: (params: ScrollParams) => void;
  readonly children:
    | ((childProps: ListItem<T>) => ReactNode | ReactNode[] | string)
    | (
        | ((childProps: ListItem<T>) => ReactNode | ReactNode[] | string)
        | ReactNode
      )[];
}

export const List = <T extends object>({
  maxHeight,
  height,
  style,
  className,
  gap,
  padding,
  itemHeight,
  items,
  children,
  itemKey,
  expand,
  reversed,
  scrollClassName,
  keyboardNavigation,
  onScroll,
  onItemSelect,
}: ListProps<T>): ReactElement => {
  // TODO: SUPPORT REVERSE
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(
    keyboardNavigation ? 0 : -1,
  );

  const ref = useRef<VirtualizedList>(null);

  const [selectedItems, setSelectedItems] = useState<uint[]>([]);

  const [states, setStates] = useState<Dictionary<ListState>>({});

  const [itemsData, setItemsData] = useState<ItemsData<T>>(
    toItemsData(items || []),
  );

  const itemRenderer: (props: ListItem<T>) => ReactNode | ReactNode[] | string =
    children instanceof Array
      ? (children.find((c) => c instanceof Function) as ListItemFn<T>)
      : children;

  const statesRenderer =
    children instanceof Array
      ? children.filter((c) => !(c instanceof Function))
      : [];

  const currentState = Object.values(states).find((sr) => sr.condition);

  const isTitle = (
    _: T | ReactNode | ReactNode[] | string,
    index: uint,
  ): _ is ReactNode | ReactNode[] | string => {
    return !!itemsData.groups[index];
  };

  useEffect(() => {
    setItemsData(toItemsData(items));
  }, [items]);

  useEffect(() => {
    ref.current?.recomputeRowHeights();
  }, [itemsData]);

  useEffect(() => {
    ref.current?.recomputeRowHeights();
  }, [selectedItems]);

  useEffect(() => {
    if (!keyboardNavigation) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.stopPropagation();
          setSelectedItemIndex((prevIndex) =>
            prevIndex < itemsData.items.length - 1 ? prevIndex + 1 : prevIndex,
          );
          return;
        case 'ArrowUp':
          event.stopPropagation();
          setSelectedItemIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : prevIndex,
          );
          return;
        case 'Enter':
          event.stopPropagation();
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          selectedItemIndex !== -1 &&
            onItemSelect &&
            // TODO: IT DOESN'T WORKS FOR GROUPS
            //@ts-expect-error-ignore
            onItemSelect(selectedItemIndex, items[selectedItemIndex]);
          return;
        default:
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemIndex, itemsData.items.length]);

  useEffect(() => {
    setSelectedItemIndex(keyboardNavigation ? 0 : -1);
  }, [itemsData.items.length]);

  const handleExpand = (currentIndex: uint) => {
    if (!expand) {
      return;
    }
    if (expand.accordion) {
      setSelectedItems([currentIndex]);
    } else {
      setSelectedItems(selectedItems.concat(currentIndex));
    }
  };

  const handleCollapse = (currentIndex: uint) => {
    if (!expand) {
      return;
    }
    setSelectedItems(selectedItems.filter((index) => index !== currentIndex));
  };

  const addListState = (s: ListState): void => {
    setStates((prev) => ({ ...prev, [s.name]: s }));
  };

  const getGroupByIndex = (itemIndex: uint): string | undefined => {
    const possibleGroups = Object.entries(itemsData.groups)
      .filter(([index]) => +index < itemIndex)
      .map(([, value]) => value.name);

    return last(possibleGroups);
  };

  const listItemRenderer: ListRowRenderer = ({ index, key, style }) => {
    const item =
      itemsData.items instanceof FastAccessList
        ? itemsData.items.atIndex(index)
        : itemsData.items[index];
    const isItemSelected = selectedItems.includes(index);

    if (isTitle(item, index)) {
      return (
        <div style={style} key={itemsData.groups[index].name || key}>
          {item}
        </div>
      );
    }

    const getKey = (item: T, itemKey: keyof T | ((item: T) => string)) => {
      if (itemKey instanceof Function) {
        return itemKey(item);
      }
      return (item[itemKey] as any) || key;
    };

    const normalizedItemHeight =
      itemHeight instanceof Function ? itemHeight(item) : itemHeight;
    return (
      <div style={style} key={getKey(item, itemKey)}>
        {itemRenderer && (
          <>
            {itemRenderer({
              item,
              index,
              active: index === selectedItemIndex,
              height: isItemSelected
                ? normalizedItemHeight + (expand?.height || 0)
                : normalizedItemHeight,
              itemHeight: normalizedItemHeight,
              expandHeight: expand?.height || 0,
              expanded: selectedItems.includes(index),
              expand: handleExpand.bind(null, index),
              collapse: handleCollapse.bind(null, index),
              group: getGroupByIndex(index),
            })}
          </>
        )}
      </div>
    );
  };

  return (
    <ListContext.Provider value={{ states: states, addState: addListState }}>
      {currentState ? (
        currentState.children
      ) : (
        <div
          className={className}
          style={{
            ...style,
            height,
            padding: getGutter(padding || 0),
            position: 'relative',
            width: '100%',
          }}
        >
          <div
            style={{
              height:
                itemHeight instanceof Function
                  ? '100%'
                  : getHeight(
                      height,
                      maxHeight,
                      expand?.height || 0,
                      itemsData.items.length,
                      selectedItems.length,
                      itemHeight,
                      itemsData.groups,
                      gap,
                    ),
            }}
          >
            <AutoSizer>
              {({ width, height }) => (
                <VirtualizedList
                  onScroll={onScroll}
                  className={
                    scrollClassName ? `no-focus ${scrollClassName}` : 'no-focus'
                  }
                  ref={ref as any}
                  height={height}
                  scrollToIndex={
                    reversed
                      ? itemsData.items.length
                      : keyboardNavigation
                        ? selectedItemIndex
                        : undefined
                  }
                  width={width}
                  rowHeight={({ index }) =>
                    getRowHeight(
                      index,
                      itemsData.items.length,
                      selectedItems,
                      itemHeight instanceof Function
                        ? itemHeight(
                            itemsData.items instanceof FastAccessList
                              ? itemsData.items.atIndex(index)
                              : (itemsData.items[index] as T),
                          )
                        : itemHeight,
                      expand?.height || 0,
                      itemsData.groups,
                      gap,
                    )
                  }
                  rowRenderer={listItemRenderer}
                  rowCount={itemsData.items.length}
                />
              )}
            </AutoSizer>
          </div>
        </div>
      )}
      {statesRenderer as any}
    </ListContext.Provider>
  );
};
