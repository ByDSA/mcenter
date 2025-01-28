export const NAME = "indent-after-decorator";

export const rule = {
  meta: {
    fixable: "code",
  },
  create(context) {
    return {
      PropertyDefinition(node) {
        const { decorators } = node;

        if (decorators && decorators.length > 0) {
          for (let i = 1; i < decorators.length; i++) {
            const decorator = decorators[i];
            const decoratorIndent = decorator.loc.start.column;
            const previousDecorator = decorators[i - 1];
            const previousDecoratorStartColumn = previousDecorator.loc.start.column;

            if (decoratorIndent !== previousDecoratorStartColumn) {
              context.report( {
                node,
                message: `Decorator should have the same indentation as the previous decorator. Expected ${previousDecoratorStartColumn} spaces but found ${decoratorIndent}.`,

                fix: (fixer) => {
                  const spaces = "\n" + " ".repeat(previousDecoratorStartColumn);
                  const range = [previousDecorator.range[1], decorator.range[0]];

                  return fixer.replaceTextRange(range, spaces);
                },
              } );
            }
          }

          const firstDecorator = decorators.at(0);
          const decoratorIndent = firstDecorator.loc.start.column;
          const propertyLine = context.getSourceCode().getText(node)
            .split("\n")
            .at(-1);
          const propertyIndent = propertyLine.search(/\S|$/); // Encuentra el primer carácter no en blanco

          if (decoratorIndent !== propertyIndent) {
            context.report( {
              node,
              message: `Property should have the same indentation as its decorator. Expected ${decoratorIndent} spaces but found ${propertyIndent}.`,
              fix: (fixer) => {
                const spaces = " ".repeat(decoratorIndent);
                let propertyTokenStartColumn = node.key.loc.start.column;
                // Para tener en cuenta carácteres especiales como "[" o "(" :
                const leftPad = propertyTokenStartColumn - propertyIndent;
                const range = [
                  node.key.range[0] - propertyTokenStartColumn,
                  node.key.range[0] - leftPad,
                ];

                return fixer.replaceTextRange(range, spaces);
              },
            } );
          }
        }
      },
    };
  },
};
