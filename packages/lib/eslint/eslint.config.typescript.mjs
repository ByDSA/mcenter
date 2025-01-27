
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
  "@typescript-eslint/naming-convention": [
    "warn",
    {
      selector: "variable",
      modifiers: ["const"],
      format: ["strictCamelCase", "UPPER_CASE"],
      filter: {
        regex: "(.*)Odm$",
        match: false,
      },
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
    {
      selector: "variable",
      modifiers: ["global", "const"],
      format: ["strictCamelCase", "UPPER_CASE"],
      filter: {
        regex: "(.*)Odm$",
        match: false,
      },
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
      /* Ejemplos:
        const UN_ARRAY = [...];
        const unArray = [...];
        const num = 1;
        const A_NUM = 1;
        const A_NUM2 = getNum();

        Con este plugin no se puede hacer que la norma dependa de si se asigna un literal o no
      */
    },
    {
      selector: "variable",
      modifiers: ["const", "destructured"],
      format: ["strictCamelCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
    },
  ],
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
    projectService: true, // Para que pueda usar el parser para las rules que lo necesiten
  },
};
