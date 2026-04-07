import { style } from "@vanilla-extract/css";

/** Корень эфирных часов: выравнивание из CSS-переменных (ноутбук vs ТВ). */
export const tournamentClockBroadcastRootCls = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "var(--chip-broadcast-clock-justify)",
  gap: "var(--chip-broadcast-clock-gap)",
  flex: 1,
  minHeight: 0,
  width: "100%",
  maxWidth: "100%",
  textAlign: "center",
  marginLeft: "auto",
  marginRight: "auto",
});
