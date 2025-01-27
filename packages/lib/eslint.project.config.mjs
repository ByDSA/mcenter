import { configs as commonConfigs } from "./eslint/eslint.config.common.mjs";
import jestMod from "./eslint/eslint.config.jest.mjs";

const projectConfig = [
  {
    files: ["**/*.ts{,x}"],
    rules: {
      "import/no-internal-modules": "off",
      "no-underscore-dangle": ["error", {
        allow: ["_id"],
      }],
    },
  },
  {
    files: ["**/*.ts{,x}"],
    ignores: ["**/models.ts", "**/models/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["\\#shared/models/**"],
              message: "Cannot import models directly from \"#shared\"",
            },
            {
              group: ["^(?!#.*).*/models(/.*)?$"],
              message: "No uses paths relativos para importar desde 'models'. Usa el alias correspondiente (Ej: '#modules/musics/models').",
            },
          ],
        },
      ],
    },
  },
];

export const configs = {
  recommended: [
    ...commonConfigs.recommended,
    ...jestMod.config,
    ...projectConfig,
  ],
};
