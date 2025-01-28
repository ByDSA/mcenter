import { Dependencies } from "../index.mjs";
import { plugin as customPlugin } from "../eslint/custom-plugins/eslint-plugin-custom.mjs";
import stylisticTsMod from "./eslint.config.stylisticTs.mjs";
import typescriptMod from "./eslint.config.typescript.mjs";

export const plugins = {
  "@typescript-eslint": typescriptMod.plugin,
  "@stylistic/ts": stylisticTsMod.plugin,
};
const rules = {
  ...typescriptMod.rules,
  ...stylisticTsMod.rules,
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

export function generateConfigs(args) {
  let files = ["**/*.ts"];

  if (args[Dependencies.React])
    files.push("**/*.tsx");

  const ret = [
    {
      files,
      settings,
      languageOptions: {
        parser: typescriptMod.parser,
        parserOptions: typescriptMod.parserOptions,
      },
      plugins: {
        ...plugins,
        custom: customPlugin,
      },
      rules: {
        ...rules,
        ...customPluginsRules,
      },
    },
  ];

  return ret;
}
