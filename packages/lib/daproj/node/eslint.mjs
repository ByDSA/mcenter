import globals from "globals";
import { Dependencies } from "daproj";

export function generateConfigs(args) {
  const files = ["**/*.js"];

  if (args[Dependencies.TypeScript])
    files.push("**/*.ts");

  const node = [
    {
      files,
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
  ];

  return node;
}
