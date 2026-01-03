import { createContext, useContext } from 'react';

import { ListState } from '../common/ListState';
import { Dictionary } from '@/core/types/types';

interface ListContextType {
  readonly states: Dictionary<ListState>;
  readonly addState: (s: ListState) => void;
}

const listContextDefaultValue: ListContextType = {
  states: {},
  addState: () => {},
};

export const ListContext = createContext<ListContextType>(
  listContextDefaultValue,
);

export const useListContext = (): ListContextType => useContext(ListContext);
