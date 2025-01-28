import globals from "globals";
import { Dependencies } from "daproj";

export function generateConfigs(args) {
  const files = ["**/*.js", "**/*.jsx"];

  if (args[Dependencies.TypeScript])
    files.push("**/*.ts", "**/*.tsx");

  const ret = [
    {
      files,
      languageOptions: {
        globals: {
          NodeJS: "readonly",
          React: "readonly",
          ...globals.node,
          ...globals.browser,
        },
      },
    },
  ];

  return ret;
}
