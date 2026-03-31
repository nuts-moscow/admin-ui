import { style } from "@vanilla-extract/css";

export const pageHeaderCls = style({
  backgroundColor: "var(--background-primary)",
  borderBottom: "1px solid var(--border-color)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  display: "flex",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 200,
  isolation: "isolate",
});

export const pageHeaderContentCls = style({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "16px",
});
