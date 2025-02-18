import { Dependencies } from "daproj";
import { generateConfigs } from "daproj/eslint";
import { configs as projectConfigs } from "../lib/eslint.project.config.mjs";

const generatedConfigs = generateConfigs( {
  [Dependencies.Jest]: true,
  [Dependencies.Eslint]: true,
  [Dependencies.Prettier]: true,
  [Dependencies.TypeScript]: true,
  [Dependencies.Node]: true,
} );
const packageConfig = [
];

export default [
  ...generatedConfigs,
  ...projectConfigs,
  ...packageConfig,
];
