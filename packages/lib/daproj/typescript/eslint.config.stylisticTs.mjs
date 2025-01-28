import stylisticTsPlugin from "@stylistic/eslint-plugin-ts";

const rules = {
  "@stylistic/ts/type-annotation-spacing": [ // Espaciado entre <variable>:<tipo>
    "error",
    {
      after: true,
      before: false,
    },
  ],
  "space-infix-ops": "off",
  "@stylistic/ts/space-infix-ops": [
    "error",
    {
      int32Hint: false,
    },
  ],
  semi: "off",
  "@stylistic/ts/semi": ["error", "always"],
  "@stylistic/ts/member-delimiter-style": ["error"], // Uso de ";" como delimitador en miembros de interfaces y tipos
  "@stylistic/ts/object-curly-newline": [
    "error",
    {
      ImportDeclaration: "never",
      ExportDeclaration: {
        multiline: true,
        minProperties: 1,
      },
      ObjectExpression: {
        minProperties: 1,
      },
      ObjectPattern: "never",
    },
  ],
  "@stylistic/ts/object-property-newline": [
    "error",
    {
      allowAllPropertiesOnSameLine: false,
    },
  ],
};

export default {
  rules,
  plugin: stylisticTsPlugin,
};
