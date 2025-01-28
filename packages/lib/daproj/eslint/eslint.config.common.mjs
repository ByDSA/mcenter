import globals from "globals";
import js from "@eslint/js";
import { Dependencies } from "daproj";
import { rules as rulesAirbnb } from "./eslint.config.airbnb.mjs";
import { plugin as pluginImport, rules as rulesImport } from "./eslint.config.import.mjs";
import { rules as rulesStylistic, plugin as pluginStylistic } from "./eslint.config.stylistic.mjs";

// @ts-check

const formatRules = {
  indent: [
    "error",
    2,
    {
      SwitchCase: 1,
      ignoredNodes: ["PropertyDefinition"], // Props after decorator
    },
  ],
  "lines-between-class-members": ["error", "always"],
  "keyword-spacing": [
    "error",
    {
      after: true,
      before: true,
    },
  ],
  "linebreak-style": ["error", "unix"],
};
const otherNoPluginRules = {
  "no-unused-vars": [
    "error",
    {
      varsIgnorePattern: "^_", // Variables declaradas (ej: const _x = 1)
      argsIgnorePattern: "^_", // Parámetros de función (ej: function(_param) {})
      caughtErrorsIgnorePattern: "^_", // Errores en catch (ej: catch(_error) {})
    },
  ],
  "no-useless-rename": "error",
  "no-await-in-loop": "off",
  "no-invalid-this": [
    "error",
    {
      capIsConstructor: false,
    },
  ],
  "no-useless-constructor": "off",
  "no-empty-function": [
    "error",
    {
      allow: ["constructors"],
    },
  ],
  curly: ["error", "multi-or-nest"],
  eqeqeq: "error",
  "no-plusplus": ["off"], // Impide usar ++ y --
  "no-multiple-empty-lines": [
    "error",
    {
      max: 1,
      maxEOF: 0,
    },
  ],
  "comma-dangle": ["error", "always-multiline"],
  quotes: ["error", "double"],
  "padding-line-between-statements": [
    "error",
    {
      blankLine: "always",
      prev: ["const", "let", "var"],
      next: "*",
    },
    {
      blankLine: "never",
      prev: ["const", "let", "var"],
      next: ["const", "let", "var"],
    },
    {
      blankLine: "always",
      prev: ["export"],
      next: ["export"],
    },
    {
      blankLine: "never",
      prev: ["case", "default"],
      next: "*",
    },
    {
      blankLine: "always",
      prev: ["if", "for", "while", "do"],
      next: "*",
    },
    {
      blankLine: "always",
      prev: "*",
      next: ["if", "for", "while", "do"],
    },
  ],
  "newline-before-return": "error",
  "nonblock-statement-body-position": ["error", "below"],
  "padded-blocks": ["error", "never"],
  "no-use-before-define": [
    "error",
    {
      functions: false,
      classes: false,
      variables: false,
    },
  ],
  "max-statements-per-line": [
    "error",
    {
      max: 1,
    },
  ],
  camelcase: "error",
  "space-in-parens": [
    "error",
    "never",
    {
      exceptions: ["{}"],
    },
  ],
  "no-var": "error",
  "dot-location": ["error", "property"],
  "prefer-destructuring": "error",
  "prefer-exponentiation-operator": "error",
  "operator-assignment": ["error", "always"],
  "require-await": "error",
  "no-new-wrappers": "error",
  "no-multi-spaces": "error",
  "rest-spread-spacing": ["error", "never"],
  "default-case-last": "error",
  "accessor-pairs": [
    "error",
    {
      getWithoutSet: true,
    },
  ],
  "no-underscore-dangle": [
    "error",
    {
      allowAfterThis: true,
    },
  ],
  "no-restricted-syntax": [
    "error",
    {
      selector: "ForInStatement",
      message:
        "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
    },
    {
      selector: "LabeledStatement",
      message:
        "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
    },
    {
      selector: "WithStatement",
      message:
        "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
    },
  ],
  "no-cond-assign": ["error", "always"],
  "no-mixed-operators": "error",
  "multiline-ternary": ["error", "always-multiline"],
  "no-case-declarations": "error",
  "no-fallthrough": "error",
  "object-curly-newline": "off", // deprecated. Usar @stylistic
  "no-restricted-imports": [
    "error",
    "fs",
    "path",
    "child_process",
    "util",
  ],
};
const noModRules = {
  ...formatRules,
  ...otherNoPluginRules,
};
const noPluginRules = {
  ...js.configs.recommended.rules,
  ...rulesAirbnb,
  ...noModRules,
};
const rules = {
  ...noPluginRules,
  ...rulesImport,
  ...rulesStylistic,
};
const plugins = {
  import: pluginImport,
  "@stylistic": pluginStylistic,
};
const configs = [
  // Scripting .mjs:
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      ...plugins,
    },
    rules: {
      ...rules,
      "import/no-internal-modules": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["**/lib/**/*.mjs"],
    rules: {
      "no-console": "warn",
      "import/no-default-export": "off",
      "import/prefer-default-export": "off",
    },
  },
  {
    ignores: ["**/{build,dist}/**", "**/node_modules/**"],
  },
  {
    files: ["index.ts", "utils.ts"],
    rules: {
      "import/prefer-default-export": "off",
    },
  },
];

export function generateConfigs(args) {
  let files = ["**/*.js"];

  if (args[Dependencies.TypeScript]) {
    files.push("**/*.ts");

    if (args[Dependencies.React])
      files.push("**/*.tsx");
  }

  if (args[Dependencies.React])
    files.push("**/*.jsx");

  const ret = [
    {
      files,
      plugins: {
        ...plugins,
      },
      rules: {
        ...rules,
      },
    },
    ...configs,
  ];

  return ret;
}
