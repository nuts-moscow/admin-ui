import { recipe } from "@vanilla-extract/recipes";
import { getGutter } from "@/core/utils/style/gutter";

export const checkboxCls = recipe({
  base: {
    display: "flex",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    margin: "2px",
    gap: getGutter(2),
    transition: "all 0.3s ease-in-out",
    borderColor: "#EBEBEB",
    color: "var(--color-primary)",
    borderRadius: "var(--radius-8)",
    outline: "none",
    border: "none",
    cursor: "pointer",
    width: getGutter(5),
    height: getGutter(5),

    ":disabled": {
      cursor: "not-allowed",
      color: "var(--text-grey)",
    },
  },
  variants: {
    size: {
      small: {
        height: getGutter(5),
        width: getGutter(5),
      },
      medium: {
        height: getGutter(4),
        width: getGutter(4),
      },
      large: {
        height: getGutter(6),
        width: getGutter(6),
      },
      xLarge: {
        height: getGutter(8),
        width: getGutter(8),
      },
    },
  },
});

export const checkboxIconCls = recipe({
  base: { display: "blocks", height: getGutter(2.5), width: getGutter(2.5) },
  variants: {
    size: {
      small: {
        height: getGutter(4),
        width: getGutter(4),
      },
      medium: {
        height: getGutter(2.5),
        width: getGutter(2.5),
      },
      large: {
        height: getGutter(3),
        width: getGutter(3),
      },
      xLarge: {
        height: getGutter(3.5),
        width: getGutter(3.5),
      },
    },
  },
});
