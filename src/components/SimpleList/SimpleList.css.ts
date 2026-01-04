import { recipe } from "@vanilla-extract/recipes";

export const simpleListCardCls = recipe({
  base: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid var(--border-primary)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  },
  variants: {
    selected: {
      true: {
        border: "1px solid #FFC402",
        boxShadow: "0 2px 8px rgba(255, 196, 2, 0.08)",
      },
    },
  },
});
