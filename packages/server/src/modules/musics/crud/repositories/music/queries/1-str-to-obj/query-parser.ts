/* eslint-disable @typescript-eslint/naming-convention */
import { CstElement, CstNode, IToken } from "@chevrotain/types";
import { AddedNode, BinaryOperationNode, FilterNode, NegationNode, NumberLiteral, PlayedNode, PrivatePlaylistNode, PublicPlaylistNode, QueryObject, RangeDate, RangeNumber, WeightNode, YearNode } from "../query-object";
import { queryLexer } from "./query-lexer";
import { QueryParser } from "./query-parser-chevrotain";

export function parseQuery(query: string): QueryObject {
  const lexingResult = queryLexer.tokenize(query);

  if (lexingResult.errors.length > 0)
    throw new Error("Error de tokenización");

  const parserInstance = new QueryParser();

  parserInstance.input = lexingResult.tokens;
  const cst = parserInstance.expression();

  if (parserInstance.errors.length > 0) {
    const msg = "Error de parsing:\n" + parserInstance.errors.map(e=>e.message).join("\n");

    throw new Error(msg);
  }

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
  // Ahora 'expression' maneja la lógica de Unión/Suma directamente
  const multiplicationExpressions = node.children.multiplicationExpression as CstNode[];
  // Procesamos los hijos (que son intersecciones)
  const operands = multiplicationExpressions.map(multiplicationExpressionToObj);

  // Si hay operadores de suma (+, |, ~), construimos el árbol
  if (node.children.AdditionOperator) {
    const operators = node.children.AdditionOperator as IToken[];

    return arrayFilterToTree(operands, operators);
  }

  // Si no hay suma, devolvemos el único hijo
  return operands[0];
};

function getOperatorType(op: IToken): BinaryOperationNode["type"] {
  const operator = op.image;

  switch (operator) {
    case "~": return "difference";
    case "|":
    case "+": return "union";
    case "*": return "intersection";
    default: throw new Error();
  }
}

function unaryExpressionToObj(node: CstNode): BinaryOperationNode | FilterNode | NegationNode {
  // Caso 1: Es una negación (tiene el token Not)
  if (node.children.Not) {
    // Recursividad: !tag o !!tag. El hijo es otra unaryExpression
    const childUnary = node.children.unaryExpression[0] as CstNode;

    return {
      type: "negation",
      child: unaryExpressionToObj(childUnary),
    };
  }

  // Caso 2: No es negación, bajamos al nivel atómico
  if (node.children.atomicExpression)
    return atomicExpressionToObj(node.children.atomicExpression[0] as CstNode);

  throw new Error("Error en unaryExpression: estructura desconocida");
}

function multiplicationExpressionToObj(
  node: CstNode,
): BinaryOperationNode | FilterNode | NegationNode {
  // Ahora los hijos son 'unaryExpression', no 'atomicExpression'
  const unaryExpressions = node.children.unaryExpression as CstNode[];
  // Procesamos los hijos (que son negaciones o atómicos)
  const operands = unaryExpressions.map(unaryExpressionToObj);

  // Si hay operadores de multiplicación (*), construimos el árbol
  if (node.children.MultiplicationOperator) {
    const operators = node.children.MultiplicationOperator as IToken[];

    return arrayFilterToTree(operands, operators);
  }

  return operands[0];
}

function arrayFilterToTree(
  nodes: (BinaryOperationNode | FilterNode | NegationNode)[],
  operatorsArray: IToken[],
): BinaryOperationNode {
  // Construir de izquierda a derecha
  let result: BinaryOperationNode = {
    type: getOperatorType(operatorsArray[0]),
    child1: nodes[0],
    child2: nodes[1],
  };

  // Para el resto de operadores, ir construyendo hacia la izquierda
  for (let i = 1; i < operatorsArray.length; i++) {
    result = {
      type: getOperatorType(operatorsArray[i]),
      child1: result,
      child2: nodes[i + 1],
    };
  }

  return result;
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
      case "playedFilter":
        return playedFilterToObj(filter);
      case "addedFilter":
        return addedFilterToObj(filter);
      case "tagFilter": {
        const slugLiteral = stringLiteralToString(filter.children.SlugLiteral);
        let value: string;

        if (filter.children.HashPrefix)
          value = `#${slugLiteral}`;
        else
          value = slugLiteral;

        return {
          type: "tag",
          value,
        };
      }
      case "privatePlaylistFilter": {
        return {
          type: "privatePlaylist",
          value: slugLiteralToString(filter.children.SlugLiteral),
        } as PrivatePlaylistNode;
      }
      case "publicPlaylistFilter": {
        const token = filter.children.PublicPlaylistLiteral[0];
        const rawText = (token as IToken).image;
        const parts = rawText.substring(1).split("/");

        return {
          type: "publicPlaylist",
          user: parts[0],
          value: parts[1],
        } as PublicPlaylistNode;
      }
      default: {
        throw new Error("Unknown filter type: " + filterType);
      }
    }
  }

  throw new Error("TODO");
};

function stringLiteralToString(stringLiteral: CstElement[]): string {
  const StringLiteralImage = slugLiteralToString(stringLiteral);

  return removeQuotes(StringLiteralImage);
}

function slugLiteralToString(slugLiteral: CstElement[]): string {
  const StringLiteralItem = (slugLiteral[0] as IToken);
  const StringLiteralImage = StringLiteralItem.image;

  return StringLiteralImage;
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
function shortRangeNumberToObj(shortRangeCst: CstElement[]): RangeNumber {
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
  else if (filter.children.rangeNumber)
    value = rangeToObj(filter.children.rangeNumber);
  else if (filter.children.shortRangeNumber)
    value = shortRangeNumberToObj(filter.children.shortRangeNumber);
  else
    throw new Error("YearFilter: unexpected CST structure: " + JSON.stringify(filter, null, 2));

  return {
    type: "year",
    value,
  };
}

function weightFilterToObj(filter: CstNode): WeightNode {
  let value: NumberLiteral | RangeNumber;

  if (filter.children.NumberLiteral)
    value = numberLiteralToObj(filter.children.NumberLiteral);
  else if (filter.children.rangeNumber)
    value = rangeToObj(filter.children.rangeNumber);
  else if (filter.children.shortRangeNumber)
    value = shortRangeNumberToObj(filter.children.shortRangeNumber);
  else
    throw new Error("WeightFilter: unexpected CST structure: " + JSON.stringify(filter, null, 2));

  return {
    type: "weight",
    value,
  };
}

function playedFilterToObj(filter: CstNode): PlayedNode {
  let value: RangeDate;

  if (filter.children.shortRangeTime)
    value = shortRangeTimeToObj(filter.children.shortRangeTime);
  else
    throw new Error("PlayedFilter: unexpected CST structure: " + JSON.stringify(filter, null, 2));

  return {
    type: "played",
    value,
  };
}
function addedFilterToObj(filter: CstNode): AddedNode {
  let value: RangeDate;

  if (filter.children.shortRangeTime)
    value = shortRangeTimeToObj(filter.children.shortRangeTime);
  else
    throw new Error("AddedFilter: unexpected CST structure: " + JSON.stringify(filter, null, 2));

  return {
    type: "added",
    value,
  };
}

function shortRangeTimeToObj(shortRangeTimeCst: CstElement[]): RangeDate {
  const shortRangeTimeCstChildren = (shortRangeTimeCst[0] as CstNode).children;
  const { timeValue } = shortRangeTimeCstChildren;
  const relativeDateString = (timeValue[0] as CstNode).children.RelativeDateString[0] as IToken;
  const value = relativeDateStringToDate(relativeDateString);

  if (shortRangeTimeCstChildren.LessEqual) {
    return {
      type: "range-date",
      max: value,
      maxIncluded: true,
    };
  }

  if (shortRangeTimeCstChildren.LessThan) {
    return {
      type: "range-date",
      max: value,
      maxIncluded: false,
    };
  }

  if (shortRangeTimeCstChildren.GreaterThan) {
    return {
      type: "range-date",
      min: value,
      minIncluded: false,
    };
  }

  if (shortRangeTimeCstChildren.GreaterEqual) {
    return {
      type: "range-date",
      min: value,
      minIncluded: true,
    };
  }

  throw new Error("A");
}

function relativeDateStringToDate(cstElement: IToken): Date {
  const { image } = cstElement;
  const result = separateNumberFromString(image);

  if (!result)
    throw new Error("Invalid relative date format: " + image);

  const { numeric: numericStr, rest } = result;
  const numeric = +numericStr;
  const now = new Date();
  let date: Date;

  switch (rest) {
    case "day":
    case "days":
    case "d":
      date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - numeric,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
      );
      break;
    case "week":
    case "weeks":
    case "w":
      date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (numeric * 7),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
      );
      break;
    case "month":
    case "months":
    case "m":
      date = new Date(
        now.getFullYear(),
        now.getMonth() - numeric,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
      );
      break;
    case "year":
    case "years":
    case "y":
      date = new Date(
        now.getFullYear() - numeric,
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
      );
      break;
    default: throw new Error("Invalid relative date format: " + rest);
  }

  return date;
}

function separateNumberFromString(image: string) {
  const match = image.match(/^(\d+)(.*)$/);

  if (match) {
    const numericPart = match[1]; // "1"
    const restPart = match[2]; // "y-ago"

    return {
      numeric: numericPart,
      rest: restPart,
    };
  }

  return null; // si no coincide el patrón
}
