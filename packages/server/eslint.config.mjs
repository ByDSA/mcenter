import path from "node:path";
import { configs as projectConfigs } from "../lib/eslint.project.config.mjs";

const packageDir = path.join(import.meta.url, "..").slice("file:".length);
const packageConfig = [
  {
    ignores: ["lib/chevrotain", "bin/live-tests", "bin/migrations"],
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
  ...projectConfigs.recommended,
  ...packageConfig,
];
