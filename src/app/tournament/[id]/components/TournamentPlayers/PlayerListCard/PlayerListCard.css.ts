import { style } from "@vanilla-extract/css";
import { getGutter } from "@/core/utils/style/gutter";

export const playerListCardContainerCls = style({
  display: "flex",
  gap: getGutter(4),
  width: "100%",
});

export const playerListCardCls = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#fff",
  border: "1px solid var(--border-primary)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
});

export const playerListCardHeaderCls = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: getGutter([3, 4]),
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
});

export const playerListCardBodyCls = style({
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
});

export const playerListRowCls = style({
  display: "flex",
  alignItems: "center",
  gap: getGutter(3),
  padding: getGutter([2.5, 4]),
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",

  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const playerListRowHighlightCls = style({
  backgroundColor: "rgba(255, 204, 0, 0.12)",
});

export const playerListRowMutedCls = style({
  backgroundColor: "rgba(94, 94, 94, 0.08)",
});

export const playerListRowNumberCls = style({
  minWidth: 28,
  textAlign: "right",
});

export const playerListRowNameCls = style({
  flex: 1,
  minWidth: 0,
});

export const playerListRowActionsCls = style({
  display: "flex",
  alignItems: "center",
  gap: getGutter(2),
  marginLeft: "auto",
});
