// @ts-check

import { configs as projectConfigs } from "./lib/eslint.project.config.mjs";

const infrastructureConfig = [
  {
    ignores: ["**/front", "**/music", "**/server", "**/shared", "**/vlc"],
  },
];

export default [
  ...projectConfigs.recommended,
  ...infrastructureConfig,
];
