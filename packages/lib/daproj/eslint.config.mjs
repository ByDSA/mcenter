import { Dependencies } from "daproj";
import { generateConfigs } from "daproj/eslint";

const generatedConfigs = generateConfigs( {
  [Dependencies.Eslint]: true,
} );

export default [
  ...generatedConfigs,
  {
    files: ["**/*.mjs"],
    rules: {
      "no-console": "warn",
    },
  },
];
