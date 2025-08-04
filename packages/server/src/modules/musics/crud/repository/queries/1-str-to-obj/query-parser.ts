/* eslint-disable @typescript-eslint/naming-convention */
import { CstElement, CstNode, IToken } from "@chevrotain/types";
import { BinaryOperationNode, DifferenceNode, FilterNode, IntersectionNode, NumberLiteral, QueryObject, RangeNumber, UnionNode, WeightNode, YearNode } from "../query-object";
import { queryLexer } from "./query-lexer";
import { QueryParser } from "./query-parser-chevrotain";

export function parseQuery(query: string): QueryObject {
  const lexingResult = queryLexer.tokenize(query);

  if (lexingResult.errors.length > 0)
    throw new Error("Error de tokenización");

  const parserInstance = new QueryParser();

  parserInstance.input = lexingResult.tokens;
  const cst = parserInstance.expression();

  if (parserInstance.errors.length > 0)
    throw new Error("Error de parsing");

  const queryObject = transformCSTToQueryObject(cst);

  return queryObject;
}

// Función para recorrer el CST y convertirlo en el formato QueryObject
function transformCSTToQueryObject(cst: CstNode): QueryObject {
  const rootNode = expressionToObj(cst);

  return {
    root: rootNode,
  };
}

const expressionToObj = (node: CstNode): any => {
  if (node.name !== "expression")
    throw new Error("Error");

  const childrenEntries = Object.entries(node.children);
  const n = childrenEntries[0][1][0] as CstNode;

  switch (n.name) {
    case "additionExpression": return additionExpressionToObj(n);
    default:
      throw new Error("D");
  }
};

function additionExpressionToObj(
  node: CstNode,
): DifferenceNode | FilterNode | IntersectionNode | UnionNode {
  const multiplicationExpressionArray = node.children.multiplicationExpression as CstNode[];

  if (multiplicationExpressionArray.length > 1) {
    const AdditionOperatorArray = node.children.AdditionOperator as IToken[];
    const filters = multiplicationExpressionArray.map(
      me=> atomicExpressionToObj(me.children.atomicExpression[0] as CstNode),
    );

    return arrayFilterToTree(filters, AdditionOperatorArray);
  }

  if (multiplicationExpressionArray.length === 1)
    return multiplicationExpressionToObj(multiplicationExpressionArray[0] as CstNode);

  throw new Error("Error");
}

function getOperatorType(op: IToken): BinaryOperationNode["type"] {
  const operator = op.image;

  switch (operator) {
    case "-": return "difference";
    case "|":
    case "+": return "union";
    case "*": return "intersection";
    default: throw new Error();
  }
}

function multiplicationExpressionToObj(node: CstNode): BinaryOperationNode | FilterNode {
  const atomicExpressionArray = node.children.atomicExpression as CstNode[];
  const filters = atomicExpressionArray.map(atomicExpressionToObj);
  const operators = node.children.MultiplicationOperator as IToken[];

  if (filters.length === 1)
    return filters[0];

  if (filters.length > 1)
    return arrayFilterToTree(filters, operators);

  throw new Error("Error");
}

function arrayFilterToTree(filters: FilterNode[], operatorsArray: IToken[]): BinaryOperationNode {
  let rootIntersection: BinaryOperationNode | undefined;
  let currentIntersection!: BinaryOperationNode;

  for (let i = 0; i < filters.length; i++) {
    if (i === 0) {
      rootIntersection = {
        type: getOperatorType(operatorsArray[0]),
        child1: filters[i],
        child2: null as any,
      } as BinaryOperationNode;
      currentIntersection = rootIntersection;
    } else if (i === filters.length - 1)
      currentIntersection.child2 = filters[i];
    else {
      currentIntersection.child2 = {
        type: getOperatorType(operatorsArray[i]),
        child1: filters[i],
        child2: null as any,
      } as BinaryOperationNode;

      currentIntersection = currentIntersection.child2;
    }
  }

  if (!rootIntersection)
    throw new Error("error");

  return rootIntersection;
}

function atomicExpressionToObj(node: CstNode): FilterNode {
  const filtersExpression = node.children.filter;

  if (filtersExpression) {
    const filterExpression = filtersExpression[0] as CstNode;
    const filterObj = filterToObj(filterExpression);

    return filterObj;
  }

  const { parenthesisExpression: parenthesisExpressions } = node.children;

  if (parenthesisExpressions) {
    const parenthesisExpression = parenthesisExpressions[0] as CstNode;
    const expression = parenthesisExpression.children.expression[0] as CstNode;

    return expressionToObj(expression);
  }

  throw new Error("Error");
}

const filterToObj = (node: CstNode): FilterNode => {
  const childrenEntries = Object.entries(node.children);

  for (const [filterType, childArray] of childrenEntries) {
    if (childArray.length !== 1)
      throw new Error("B");

    const filter = (childArray[0] as CstNode);

    switch (filterType) {
      case "yearFilter":
        return yearFilterToObj(filter);
      case "weightFilter":
        return weightFilterToObj(filter);
      case "tagFilter":
      {
        return {
          type: "tag",
          value: stringLiteralToString(filter.children.StringLiteral),
        };
      }
      default:
        throw new Error("D");
    }
  }

  throw new Error("TODO");
};

function stringLiteralToString(stringLiteral: CstElement[]): string {
  const StringLiteralItem = (stringLiteral[0] as IToken);
  const StringLiteralImage = StringLiteralItem.image;

  return removeQuotes(StringLiteralImage);
}

function removeQuotes(input: string): string {
  if (input[0] === input.at(-1) && (
    input[0] === "\"" || input[0] === "'"
  ))
    return input.substring(1, input.length - 1);

  if ((input[0] === "\"" && input.at(-1) !== "\"")
    || (input.at(-1) === "\"" && input[0] !== "\"")
  || (input[0] === "'" && input.at(-1) !== "'")
  || (input.at(-1) === "'" && input[0] !== "'"))
    throw new Error("Non closed quotes");

  return input;
}

function numberLiteralToObj(numberLiteral: CstElement[]): NumberLiteral {
  const NumberLiteralItem = (numberLiteral[0] as IToken);
  const NumberLiteralImage = NumberLiteralItem.image;

  return {
    type: "number",
    value: +NumberLiteralImage,
  };
}

function rangeToObj(rangeCst: CstElement[]): RangeNumber {
  const rangeCstChildren = (rangeCst[0] as CstNode).children;
  const NumberLiteralArray = rangeCstChildren.NumberLiteral;

  if (NumberLiteralArray.length === 2) {
    const min = +(NumberLiteralArray[0] as IToken).image;
    const max = +(NumberLiteralArray[1] as IToken).image;

    return {
      type: "range",
      min,
      minIncluded: true,
      max,
      maxIncluded: true,
    };
  }

  if (NumberLiteralArray.length === 1) {
    const value = +(NumberLiteralArray[0] as IToken).image;
    const isMin = (rangeCstChildren.Comma[0] as IToken).startOffset
      > (NumberLiteralArray[0] as IToken).startOffset;

    if (isMin) {
      return {
        type: "range",
        min: value,
        minIncluded: true,
      };
    }

    return {
      type: "range",
      max: value,
      maxIncluded: true,
    };
  }

  throw new Error("A");
}
function shortRangeToObj(shortRangeCst: CstElement[]): RangeNumber {
  const shortRangeCstChildren = (shortRangeCst[0] as CstNode).children;
  const NumberLiteralArray = shortRangeCstChildren.NumberLiteral;

  if (NumberLiteralArray.length !== 1)
    throw new Error("A");

  const value = +(NumberLiteralArray[0] as IToken).image;

  if (shortRangeCstChildren.LessEqual) {
    return {
      type: "range",
      max: value,
      maxIncluded: true,
    };
  }

  if (shortRangeCstChildren.LessThan) {
    return {
      type: "range",
      max: value,
      maxIncluded: false,
    };
  }

  if (shortRangeCstChildren.GreaterThan) {
    return {
      type: "range",
      min: value,
      minIncluded: false,
    };
  }

  if (shortRangeCstChildren.GreaterEqual) {
    return {
      type: "range",
      min: value,
      minIncluded: true,
    };
  }

  throw new Error("A");
}

function yearFilterToObj(filter: CstNode): YearNode {
  let value: NumberLiteral | RangeNumber;

  if (filter.children.NumberLiteral)
    value = numberLiteralToObj(filter.children.NumberLiteral);
  else if (filter.children.range)
    value = rangeToObj(filter.children.range);
  else if (filter.children.shortRange)
    value = shortRangeToObj(filter.children.shortRange);
  else
    throw new Error("a");

  return {
    type: "year",
    value,
  };
}

function weightFilterToObj(filter: CstNode): WeightNode {
  let value: NumberLiteral | RangeNumber;

  if (filter.children.NumberLiteral)
    value = numberLiteralToObj(filter.children.NumberLiteral);
  else if (filter.children.range)
    value = rangeToObj(filter.children.range);
  else if (filter.children.shortRange)
    value = shortRangeToObj(filter.children.shortRange);
  else
    throw new Error("a");

  return {
    type: "weight",
    value,
  };
}
