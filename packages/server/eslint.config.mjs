import path from "node:path";
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
const packageDir = path.join(import.meta.url, "..").slice("file:".length);
const packageConfig = [
  {
    ignores: ["lib/chevrotain", "bin/live-tests", "bin/migrations", "coverage"],
  },
  {
    files: ["**/*.ts"],
    rules: {
      "import/no-extraneous-dependencies": ["error", {
        packageDir,
      }],
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
];

export default [
  ...generatedConfigs,
  ...projectConfigs,
  ...packageConfig,
];
