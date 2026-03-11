import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import {
  tableListCls,
  tableListItemCls,
  tableListItemBadgeCls,
} from "./TableList.css";
import { Box } from "@/components/Box/Box";

export interface TableListItem {
  readonly tableNumber: number;
  readonly currentPlayers: number;
  readonly maxPlayers: number;
}

const TABLES: TableListItem[] = Array.from({ length: 10 }, (_, i) => ({
  tableNumber: i + 1,
  currentPlayers: 5,
  maxPlayers: 10,
}));

export const TableList: FC = () => {
  return (
    <Box className={tableListCls}>
      {TABLES.map((item) => (
        <Box key={item.tableNumber} className={tableListItemCls}>
          <Typography.Text
            type="primary"
            size="small"
            className={tableListItemBadgeCls}
          >
            {item.tableNumber}
          </Typography.Text>
          <Typography.Text type="secondary" size="small">
            {item.currentPlayers}/{item.maxPlayers}
          </Typography.Text>
        </Box>
      ))}
    </Box>
  );
};
