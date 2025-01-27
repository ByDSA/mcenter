import path from "node:path";
import { configs as projectConfigs } from "../lib/eslint.project.config.mjs";

const packageDir = path.join(import.meta.url, "..").slice("file:".length);
const packageConfig = [
  {
    files: ["**/*.ts"],
    rules: {
      "import/no-extraneous-dependencies": ["error", {
        packageDir,
      }],
    },
  },
];

export default [
  ...projectConfigs.recommended,
  ...packageConfig,
];
