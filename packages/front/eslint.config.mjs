// @ts-check

import { Dependencies } from "daproj";
import { generateConfigs } from "daproj/eslint";
import { configs as projectConfigs } from "../lib/eslint.project.config.mjs";

const generatedConfigs = generateConfigs( {
  [Dependencies.Jest]: true,
  [Dependencies.Eslint]: true,
  [Dependencies.Prettier]: true,
  [Dependencies.TypeScript]: true,
  [Dependencies.React]: true,
} );
const packageConfig = [
  {
    ignores: [".next/**"],
  },
  {
    files: ["**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [ // No funciona usar {episodes,musics}
                "\\#modules/episodes",
                "\\#modules/musics",
              ],
              message: "Usa el alias interno correspondiente en lugar de #modules/* (Ej: '#musics/models').",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/page.tsx", "**/layout.tsx"],
    rules: {
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
    },
  },
];

export default [
  ...generatedConfigs,
  ...projectConfigs,
  ...packageConfig,
];
