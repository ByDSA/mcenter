import stylisticPlugin from "@stylistic/eslint-plugin";

const rules = {
  "@stylistic/newline-per-chained-call": [
    "error",
    {
      ignoreChainWithDepth: 2,
    },
  ],
};

export default {
  rules,
  plugin: stylisticPlugin,
};
