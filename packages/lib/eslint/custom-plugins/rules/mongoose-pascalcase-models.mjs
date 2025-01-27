import { ESLintUtils } from "@typescript-eslint/utils";

export const NAME = "mongoose-pascalcase-models";

export const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Los modelos de Mongoose deben usar PascalCase",
      recommended: true,
    },
    schema: [], // Sin opciones configurables
  },
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices?.program?.getTypeChecker();

    if (!checker)
      return {};

    return {
      VariableDeclaration(node) {
        for (const declaration of node.declarations) {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(declaration.id);
          const type = checker.getTypeAtLocation(tsNode);

          // Verifica si es un modelo de Mongoose
          if (type.symbol && type.symbol.escapedName === "Model" && type.symbol.parent.escapedName === "\"mongoose\"") {
            const variableName = declaration.id.name;

            // Valida PascalCase
            if (!/^[A-Z][a-zA-Z0-9]*$/.test(variableName)) {
              context.report( {
                node,
                message: "Los modelos de Mongoose deben usar PascalCase.",
              } );
            }
          }
        }
      },
    };
  },
};
