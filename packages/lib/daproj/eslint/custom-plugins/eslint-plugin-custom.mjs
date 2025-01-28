/* eslint-disable max-len */
/* eslint-disable func-names */

import { NAME as mongoosePascalCaseModelsName, rule as mongoosePascalCaseModelsRule } from "./rules/mongoose-pascalcase-models.mjs";
import { NAME as indentAfterDecoratorName, rule as indentAfterDecoratorRule } from "./rules/indent-after-decorator.mjs";

export const plugin = {
  meta: {
    name: "eslint-plugin-custom",
    version: "0.0.1",
  },
  rules: {
    "no-leading-blank-lines": {
      meta: {
        fixable: "code",
      },
      create(context) {
        const checkNode = (node) => {
          const sourceCode = context.getSourceCode();
          const { lines } = sourceCode;
          let line = 0;

          while (line < lines.length && lines[line].trim() === "") {
            context.report( {
              node,
              loc: { line: line + 1, column: 0 },
              message: "Leading blank lines are not allowed.",
              fix: function (fixer) {
                const rangeStart = sourceCode.getIndexFromLoc( { line: line + 1, column: 0 } );
                const rangeEnd = sourceCode.getIndexFromLoc( { line: line + 2, column: 0 } );

                return fixer.removeRange([rangeStart, rangeEnd]);
              },
            } );
            line++;
          }
        };

        return {
          Program: checkNode,
        };
      },
    },
    "no-blank-lines-after-decorator": {
      meta: {
        fixable: "code",
      },
      create(context) {
        function checkNode(node) {
          const { decorators } = node;

          if (decorators && decorators.length > 0) {
            const decorator = decorators.at(-1);
            const decoratorLine = decorator.loc.end.line;
            let nodeLoc;
            let nodeRange;

            if (node.type === "ClassDeclaration") {
              nodeLoc = node.loc;
              nodeRange = node.range;
            } else {
              nodeLoc = node.key.loc;
              nodeRange = node.key.range;
            }

            let nodeLine = nodeLoc.start.line;

            if (decoratorLine + 1 !== nodeLine) {
              context.report( {
                node,
                message: "There should be no blank lines after a decorator.",
                fix: function (fixer) {
                  const range = [decorator.range[1], nodeRange[0] - nodeLoc.start.column];

                  return fixer.replaceTextRange(range, "\n");
                },
              } );
            }
          }
        };

        return {
          PropertyDefinition: checkNode,
          MethodDefinition: checkNode,
          ClassDeclaration: checkNode,
        };
      },
    },
    "no-blank-lines-between-decorators": {
      meta: {
        fixable: "code",
      },
      create(context) {
        return {
          PropertyDefinition(node) {
            const { decorators } = node;

            for (let i = 1; i < decorators.length; i++) {
              const previousDecorator = decorators[i - 1];
              const currentDecorator = decorators[i];
              const previousDecoratorLine = previousDecorator.loc.end.line;
              const currentDecoratorLine = currentDecorator.loc.start.line;

              if (previousDecoratorLine + 1 !== currentDecoratorLine) {
                context.report( {
                  node,
                  message: "There should be no blank lines between decorators.",
                  fix: function (fixer) {
                    const range = [previousDecorator.range[1], currentDecorator.range[0] - currentDecorator.loc.start.column];

                    return fixer.replaceTextRange(range, "\n");
                  },
                } );
              }
            }
          },
        };
      },
    },
    [indentAfterDecoratorName]: indentAfterDecoratorRule,
    [mongoosePascalCaseModelsName]: mongoosePascalCaseModelsRule,
  },
};
