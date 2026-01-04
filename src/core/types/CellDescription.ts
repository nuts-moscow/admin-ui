import BaseTable, { ColumnShape } from "react-base-table";
import { uint } from "./types";

export interface CellDescriptor<T> {
  cellData: unknown;
  columns: ColumnShape<T>[];
  column: ColumnShape<T>;
  columnIndex: uint;
  rowData: T;
  rowIndex: uint;
  container: BaseTable<T>;
  isScrolling?: boolean;
}
