import stylisticPlugin from "@stylistic/eslint-plugin";

export const rules = {
  "@stylistic/newline-per-chained-call": [
    "error",
    {
      ignoreChainWithDepth: 2,
    },
  ],
};

export const plugin = stylisticPlugin;
