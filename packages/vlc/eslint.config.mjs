import { configs as projectConfigs } from "../lib/eslint.project.config.mjs";

const packageConfig = [
];

export default [
  ...projectConfigs.recommended,
  ...packageConfig,
];
