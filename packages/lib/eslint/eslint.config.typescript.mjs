import plugin from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

const rules = {
  "@typescript-eslint/no-empty-object-type": "error", // Impide usar el tipo desaconsejado {} (objeto vacío).
  "@typescript-eslint/no-floating-promises": "error", // Impide no capturar promesas
  "@typescript-eslint/no-unsafe-function-type": "error", // Impide usar Function como tipo
  "@typescript-eslint/no-wrapper-object-types": "error", // Impide usar los tipos String, Number, Boolean, Symbol, Object
  "@typescript-eslint/sort-type-constituents": "error", // Ordena los union/intersection
  "no-unused-vars": "off", // impide declarar variables que no se usan
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      args: "all",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],
  "no-shadow": "off", // impide redeclarar variables en scopes internos
  "@typescript-eslint/no-shadow": ["error"],
};

export default {
  rules,
  plugin,
  parser,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    projectService: {
      allowDefaultProject: ["*.js", "*.mjs"],
    },
  },
};
