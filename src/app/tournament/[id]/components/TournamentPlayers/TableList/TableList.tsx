import { FC, useMemo } from "react";
import { Typography } from "@/components/Typography/Typography";
import { clsx } from "clsx";
import {
  tableListCls,
  tableListItemActiveCls,
  tableListItemCls,
  tableListItemBadgeCls,
  tableListItemSelectableCls,
  tableListItemSelectedCls,
} from "./TableList.css";
import { Box } from "@/components/Box/Box";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";

export interface TableListItem {
  readonly tableNumber: number;
  readonly currentPlayers: number;
}

const MIN_TABLES_COUNT = 10;

export interface TableListProps {
  readonly tournamentId: string;
  readonly selectable?: boolean;
  readonly selectedTableId?: number;
  readonly onSelectTable?: (tableId: number) => void;
}

export const TableList: FC<TableListProps> = ({
  tournamentId,
  selectable = false,
  selectedTableId,
  onSelectTable,
}) => {
  const { data: players } = useTournamentPlayerState(tournamentId);
  const tables = useMemo<TableListItem[]>(() => {
    const byTableId = new Map<number, number>();

    (players ?? []).forEach((player) => {
      if (!player.tableId) {
        return;
      }
      byTableId.set(player.tableId, (byTableId.get(player.tableId) ?? 0) + 1);
    });

    const maxTableNumberFromData = Math.max(0, ...Array.from(byTableId.keys()));
    const totalTables = Math.max(MIN_TABLES_COUNT, maxTableNumberFromData);

    return Array.from({ length: totalTables }, (_, index) => {
      const tableNumber = index + 1;
      return {
        tableNumber,
        currentPlayers: byTableId.get(tableNumber) ?? 0,
      };
    });
  }, [players]);

  return (
    <Box className={tableListCls}>
      {tables.map((item) => (
        <Box
          key={item.tableNumber}
          className={clsx(
            tableListItemCls,
            item.currentPlayers > 0 && tableListItemActiveCls,
            selectable && tableListItemSelectableCls,
            selectedTableId === item.tableNumber && tableListItemSelectedCls
          )}
          onClick={
            selectable
              ? () => {
                  onSelectTable?.(item.tableNumber);
                }
              : undefined
          }
        >
          <Typography.Text
            type="primary"
            size="small"
            className={tableListItemBadgeCls}
          >
            {item.tableNumber}
          </Typography.Text>
          <Typography.Text type="secondary" size="small">
            {item.currentPlayers}/10
          </Typography.Text>
        </Box>
      ))}
    </Box>
  );
};
