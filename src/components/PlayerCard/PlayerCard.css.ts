import { style } from "@vanilla-extract/css";

export const playerCardCls = style({
  backgroundColor: "var(--bg-primary)",
  borderRadius: "16px",
  border: "1px solid var(--border-primary)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  transition: "all 0.2s ease-in-out",
  selectors: {
    "&:hover": {
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
      transform: "translateY(-2px)",
    },
  },
});

export const playerCardColumnCls = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: 1,
  minWidth: 100,
});
