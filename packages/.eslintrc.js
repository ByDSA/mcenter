module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    "jest/globals": true,
  },
  globals: {
    NodeJS: true,
    React: true,
  },
  extends: ["airbnb-base", "prettier", "plugin:@next/next/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import", "jest", "prettier"],
  rules: {
    "no-await-in-loop": "off",
    "import/no-internal-modules": [
      "error",
      {
        allow: [
          "*modules/*",
          "*modules/utils/**",
          "*utils/**",
          "*shared/utils/**",
          "*shared/models/*",
        ],
      },
    ],
    "no-invalid-this": [
      "error",
      {
        capIsConstructor: false,
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.{test,spec}.{ts,tsx}", "**/test/**"],
      },
    ],
    "no-useless-constructor": "off",
    "no-empty-function": [
      "error",
      {
        allow: ["constructors"],
      },
    ],
    indent: [
      "error",
      2,
      {
        SwitchCase: 1,
      },
    ],
    "@typescript-eslint/sort-type-union-intersection-members": "error",
    "@typescript-eslint/type-annotation-spacing": [
      "error",
      {
        after: true,
        before: false,
      },
    ],
    "@typescript-eslint/space-infix-ops": [
      "error",
      {
        int32Hint: false,
      },
    ],
    curly: ["error", "multi-or-nest"],
    eqeqeq: "error",
    semi: "off",
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/member-delimiter-style": ["error"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_$",
      },
    ],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "no-plusplus": ["off"],
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "import/no-cycle": [
      "error",
      {
        maxDepth: 1,
      },
    ],
    "no-multiple-empty-lines": [
      "error",
      {
        max: 1,
        maxEOF: 0,
      },
    ],
    "newline-per-chained-call": [
      "error",
      {
        ignoreChainWithDepth: 2,
      },
    ],
    "object-curly-newline": [
      "error",
      {
        ImportDeclaration: "never",
        ExportDeclaration: {
          multiline: true,
          minProperties: 1,
        },
        ObjectExpression: "always",
        ObjectPattern: "never",
      },
    ],
    "object-property-newline": [
      "error",
      {
        allowAllPropertiesOnSameLine: false,
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
    "space-infix-ops": "error",
    "no-case-declarations": "error",
    "no-fallthrough": "error",
    "lines-between-class-members": ["error", "always"],
    "keyword-spacing": [
      "error",
      {
        after: true,
        before: true,
      },
    ],
    "linebreak-style": ["error", "unix"],
  },
  overrides: [
    {
      files: ["*.spec.ts", "**/test/**/*.ts", "**/tests/**/*.ts"],
      rules: {
        "import/no-internal-modules": [
          "error",
          {
            allow: [
              "*modules/*",
              "**/repositories/*",
              "*modules/utils/**",
              "*utils/**",
              "*shared/utils/**",
              "*shared/models/*",
              "**/test/**",
              "**/tests/**",
            ],
          },
        ],
      },
    },
    {
      files: [
        "*{s,S}ervice*.{ts,js}",
        "*{r,R}epository*.{ts,js}",
        "*{c,C}ontroller*.{ts,js}",
      ],
      rules: {
        "require-await": "off",
        "class-methods-use-this": "off",
      },
    },
    {
      files: ["index.ts", "{,*.}o{d,r}m.{ts,js}", "utils.ts"],
      rules: {
        "import/prefer-default-export": "off",
      },
    },
    {
      files: ["{,*.}odm.{ts,js}", "Repository.{ts,js}"],
      rules: {
        "no-underscore-dangle": [
          "error",
          {
            allow: ["_id"],
          },
        ],
      },
    },
    {
      files: ["*.mjs"],
      rules: {
        "no-console": "off",
        "require-await": "off",
      },
      globals: {
        $: true,
        argv: true,
        path: true,
        fs: true,
        cd: true,
        chalk: true,
      },
    },
  ],
  settings: {
    "import/no-cycle": false,
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
  },
};
