import { recipe } from "@vanilla-extract/recipes";

export const controlRootCls = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "text",
    font: "var(--font-medium)",
    fontFamily: "var(--primary-font-family), serif",
    fontWeight: 700,
    transition: "background-color 0.2s, border-color 0.2s",
    willChange: "background-color, border-color",
    width: "100%",
  },
  variants: {
    color: {
      disabled: {
        color: "var(--text-primary-disabled)",
      },
      active: {
        color: "var(--text-primary)",
      },
    },
    type: {
      secondary: {
        backgroundColor: "var(--background-input-color)",
      },
      primary: {
        backgroundColor: "var(--background-primary)",
      },
    },
    borderRadius: {
      l: {
        borderRadius: 12,
      },
      m: {
        borderRadius: "var(--radius-6)",
      },
    },
    size: {
      small: {
        padding: "0 calc(var(--base-gutter) * 3)",
      },
      medium: {
        padding: "0 calc(var(--base-gutter) * 3)",
      },
      large: {
        padding: "0 calc(var(--base-gutter) * 3)",
      },
      xLarge: {
        padding: "0 calc(var(--base-gutter) * 3)",
      },
    },
    border: {
      true: {
        border: "1px solid var(--border-color)",
      },
    },
    error: {
      true: {
        border: "1px solid var(--background-red-button-color)",
      },
    },
  },
});
