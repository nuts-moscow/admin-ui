import { recipe } from "@vanilla-extract/recipes";

export const nextLinkCls = recipe({
  base: {
    textDecoration: "none",
    color: "inherit",
  },
  variants: {
    justify: {
      true: {
        width: "100%",
      },
    },
  },
});
