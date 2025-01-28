import globals from "globals";

const eslint = [
  {
    files: ["**/eslint.config.mjs"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
      "import/no-internal-modules": "off",
      "import/no-extraneous-dependencies": "off",
      "no-console": "warn",
    },
  },
];

export function generateConfigs(_args) {
  return eslint;
}
