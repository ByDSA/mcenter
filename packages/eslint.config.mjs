// @ts-check
import { Dependencies } from "daproj";
import { generateConfigs } from "daproj/eslint";
import { configs as projectConfigs } from "./lib/eslint.project.config.mjs";

const generatedConfigs = await generateConfigs( {
  [Dependencies.Jest]: true,
  [Dependencies.Eslint]: true,
  [Dependencies.Prettier]: true,
  [Dependencies.TypeScript]: true,
} );
const infrastructureConfig = [
  {
    ignores: ["**/front", "**/music", "**/server", "**/shared", "**/vlc"],
  },
];

export default [
  ...generatedConfigs,
  ...projectConfigs,
  ...infrastructureConfig,
];
