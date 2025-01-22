import jestPlugin from "eslint-plugin-jest";

const recommended = jestPlugin.configs["flat/recommended"];
const rules = {
  ...recommended.rules,
  "jest/consistent-test-it": ["error", {
    fn: "it", // Obliga a usar 'it' y no 'test'
  }],
  "jest/expect-expect": "error", // Obliga a usar expect en los tests
  "jest/no-export": "error", // Que no se puede exportar nada en los tests
  "jest/prefer-lowercase-title": "error", // Obliga a usar nombres de test en lowercase
  "jest/prefer-to-be": "error", // Obliga a usar toBe en vez de toEqual para tipos primitivos
  "jest/prefer-to-contain": "error", // Obliga a usar toContain en vez de .includes (es más corto)
  "jest/no-disabled-tests": "warn",
  "jest/no-focused-tests": "error",
  "jest/no-identical-title": "error",
  "jest/prefer-to-have-length": "warn",
  "jest/valid-expect": "error",
};
const plugin = recommended.plugins.jest;

export default {
  rules,
  plugin,
  config: [
    {
      files: ["**/*.{e2e,}.{test,spec}.ts{x,}", "**/test{s,}/**/*.ts"],
      plugins: {
        jest: plugin,
      },
      languageOptions: {
        globals: plugin.environments.globals.globals,
      },
      rules,
    },
  ],
};
