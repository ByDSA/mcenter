import jestPlugin from "eslint-plugin-jest";
import customPlugin from "./custom-plugins/eslint-plugin-custom.mjs";
import importMod from "./eslint.config.import.mjs";
import typescriptMod from "./eslint.config.typescript.mjs";

const recommended = jestPlugin.configs["flat/recommended"];
const rules = {
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
const plugin = recommended.plugins.jest;

export default {
  rules,
  plugin,
  config: [
    {
      files: ["**/*.{,e2e.}{test,spec}.ts{,x}", "**/test{s,}/**/*.ts"],
      plugins: {
        jest: plugin,
      },
      languageOptions: {
        globals: jestPlugin.environments.globals.globals,
      },
      rules,
    },
    {
      files: ["**/jest.*.ts"],
      plugins: {
        "@typescript-eslint": typescriptMod.plugin,
        custom: customPlugin,
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
    },
    {
      files: ["**/jest.setup.ts"],
      languageOptions: {
        globals: jestPlugin.environments.globals.globals,
        parserOptions: {
          projectService: false,
        },
      },
    },
    {
      files: ["**/jest.config.ts"],
      plugins: {
        import: importMod.plugin,
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
  ],
};
