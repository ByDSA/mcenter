import globals from "globals";
import js from "@eslint/js";
import customPlugin from "./custom-plugins/eslint-plugin-custom.mjs";
import airbnbMod from "./eslint.config.airbnb.mjs";
import importMod from "./eslint.config.import.mjs";
import stylisticTsMod from "./eslint.config.stylisticTs.mjs";
import stylisticMod from "./eslint.config.stylistic.mjs";
import typescriptMod from "./eslint.config.typescript.mjs";

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
const tsRules = {
  ...typescriptMod.rules,
  ...stylisticTsMod.rules,
};
const noPluginRules = {
  ...js.configs.recommended.rules,
  ...airbnbMod.rules,
  ...noModRules,
};
const jsRules = {
  ...noPluginRules,
  ...importMod.rules,
  ...stylisticMod.rules,
};
const jsPlugins = {
  import: importMod.plugin,
  "@stylistic": stylisticMod.plugin,
};
const tsPlugins = {
  "@typescript-eslint": typescriptMod.plugin,
  "@stylistic/ts": stylisticTsMod.plugin,
};
const settings = {
  "import/parsers": {
    "@typescript-eslint/parser": [".ts", ".tsx"],
  },
  "import/resolver": {
    node: {
      paths: ["src"],
    },
    typescript: {
      alwaysTryTypes: true,
    },
  },
};
const customPluginsRules = {
  "custom/indent-after-decorator": "error",
  "custom/no-blank-lines-after-decorator": "error",
  "custom/no-blank-lines-between-decorators": "error",
  "custom/no-leading-blank-lines": "error",
  "custom/mongoose-pascalcase-models": "error",
};

export const configs = {
  recommended: [
  // React:
    {
      files: ["**/*.jsx", "**/*.jsx", "**/*.ts", "**/*.tsx"],
      languageOptions: {
        globals: {
          NodeJS: "readonly",
          React: "readonly",
          ...globals.node,
          ...globals.browser,
        },
      },
    },
    // Node:
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
      plugins: {
        ...jsPlugins,
      },
      rules: {
        ...jsRules,
      },
    },
    // TypeScript:
    {
      files: ["**/*.ts", "**/*.tsx"],
      settings,
      languageOptions: {
        parser: typescriptMod.parser,
        parserOptions: typescriptMod.parserOptions,
      },
      plugins: {
        ...tsPlugins,
        custom: customPlugin,
      },
      rules: {
        ...tsRules,
        ...customPluginsRules,
      },
    },
    // Scripting .mjs:
    {
      files: ["**/*.mjs"],
      languageOptions: {
        globals: {
          ...globals.node,
          argv: true,
          $: true,
          path: true,
          fs: false,
          cd: true,
          chalk: true,
        },
      },
      plugins: {
        ...jsPlugins,
      },
      rules: {
        ...jsRules,
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
      files: ["**/eslint.config.mjs"],
      settings,
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
        globals: {
          ...globals.node,
        },
      },
      plugins: {
        ...jsPlugins,
      },
      rules: {
        ...jsRules,
        "import/no-default-export": "off",
        "import/prefer-default-export": "error",
        "import/no-internal-modules": "off",
        "import/no-extraneous-dependencies": "off",
      },
    },
    // Prettier:
    {
      files: ["**/prettier.config.mjs"],
      plugins: {
        ...jsPlugins,
      },
      rules: {
        ...jsRules,
        "import/no-default-export": "off",
        "import/prefer-default-export": "error",
        "import/no-internal-modules": "off",
        "import/no-extraneous-dependencies": "off",
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
  ],
};
