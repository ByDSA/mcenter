// @ts-check

import jestPlugin from "eslint-plugin-jest";
import globals from "globals";
import { plugin as pluginImport } from "../../eslint/eslint.config.import.mjs";
import { plugins as pluginsTs } from "../../typescript/eslint.mjs";
import { Dependencies } from "../../index.mjs";

const recommended = jestPlugin.configs["flat/recommended"];

export const rules = {
  ...recommended.rules,
  "jest/consistent-test-it": ["error", {
    fn: "it", // Obliga a usar 'it' y no 'test'
  }],
  "jest/expect-expect": ["error", // Obliga a usar expect en los tests
    {
      assertFunctionNames: [
        "expect",
        "request(.*).expect", // Supertest
        "expect*",
      ],
    },
  ],
  "jest/no-export": "error", // Que no se puede exportar nada en los tests
  "jest/prefer-lowercase-title": "error", // Obliga a usar nombres de test en lowercase
  "jest/prefer-to-be": "error", // Obliga a usar toBe en vez de toEqual para tipos primitivos
  "jest/prefer-to-contain": "error", // Obliga a usar toContain en vez de .includes (es más corto)
  "jest/no-disabled-tests": "warn",
  "jest/no-focused-tests": "error",
  "jest/no-identical-title": "error",
  "jest/prefer-to-have-length": "warn",
  "jest/valid-expect": "error",
  "jest/padding-around-all": "error",
};

export const plugin = recommended.plugins.jest;

export function generateConfigs(args) {
  let files = [];
  let ext;

  if (args[Dependencies.TypeScript])
    ext = "ts";
  else
    ext = "js";

  files.push("**/test{s,}/**/*." + ext);

  if (args[Dependencies.TypeScript])
    ext = "ts";
  else
    ext = "js";

  const jestSetupFile = "**/jest.setup." + ext;
  const jestConfigFile = "**/jest.config." + ext;

  if (args[Dependencies.React])
    ext += "{,x}";

  files.push("**/*.{,e2e.}{test,spec}." + ext);

  const ret = [];

  if (args[Dependencies.TypeScript]) {
    ret.push( {
      files: ["**/jest.*.ts"],
      plugins: {
        ...pluginsTs,
      },
      rules: {
        "@typescript-eslint/no-floating-promises": "off",
        "custom/mongoose-pascalcase-models": "off",
      },
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
      },
    } );
  }

  ret.push(...[
    {
      files,
      plugins: {
        jest: plugin,
      },
      languageOptions: {
        globals: jestPlugin.environments.globals.globals,
      },
      rules,
    },
    {
      files: [jestSetupFile],
      languageOptions: {
        globals: {
          ...jestPlugin.environments.globals.globals,
          ...globals.node,
        },
        parserOptions: {
          projectService: false,
        },
      },
    },
    {
      files: [jestConfigFile],
      plugins: {
        import: pluginImport,
      },
      languageOptions: {
        parserOptions: {
          projectService: false,
        },
      },
      rules: {
        "import/no-default-export": "off",
      },
    },
  ]);

  return ret;
}
