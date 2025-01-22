import path from "node:path";
import tseslint from "typescript-eslint";
import monorepoConfig from "../eslint.config.mjs";

const packageDir = path.join(import.meta.url, "..").slice("file:".length);
const projectConfig = [
  {
    files: ["**/*.ts"],
    rules: {
      "import/no-internal-modules": "off",
      "import/no-extraneous-dependencies": ["error", {
        packageDir,
      }],
      "no-underscore-dangle": ["error", {
        allow: ["_id"],
      }],
    },
  },
];
const ret = tseslint.config([
  ...monorepoConfig,
  ...projectConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);

export default ret;
