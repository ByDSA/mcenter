const prettier = [
  {
    files: ["**/prettier.config.mjs"],
    rules: {
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
      "import/no-internal-modules": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
];

// eslint-disable-next-line no-unused-vars
export function generateConfigs(args) {
  return prettier;
}
