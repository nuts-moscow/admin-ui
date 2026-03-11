import { style } from "@vanilla-extract/css";
import { getGutter } from "@/core/utils/style/gutter";

export const tableListCls = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  width: "100%",
  gap: getGutter(2),
});

export const tableListItemCls = style({
  display: "flex",
  flexDirection: "column",
  cursor: "default",
  alignItems: "center",
  justifyContent: "center",
  gap: getGutter(1.5),
  padding: getGutter([3, 4]),
  backgroundColor: "rgba(94, 94, 94, 0.22)",
  borderRadius: 24,
  minWidth: 100,
});

export const tableListItemActiveCls = style({
  backgroundColor: "rgba(255, 196, 2, 0.22)",
  border: "1px solid rgba(255, 196, 2, 0.55)",
});

export const tableListItemSelectableCls = style({
  cursor: "pointer",
});

export const tableListItemSelectedCls = style({
  border: "2px solid var(--text-accent)",
  boxShadow: "0 0 0 2px rgba(255, 196, 2, 0.18)",
});

export const tableListItemBadgeCls = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: "var(--background-primary)",
  fontWeight: "bold",
  fontSize: 16,
  color: "var(--text-primary)",
});
