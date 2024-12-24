/* eslint-disable no-use-before-define */
import { createToken, Lexer } from "chevrotain";

// Definición de tokens
export const AdditionOperator = createToken( {
  name: "AdditionOperator",
  pattern: Lexer.NA,
} );

export const Plus = createToken( {
  name: "Or",
  pattern: /\+|\|/,
  categories: AdditionOperator,
} );

export const Minus = createToken( {
  name: "Minus",
  pattern: /-/,
  categories: AdditionOperator,
} );

export const MultiplicationOperator = createToken( {
  name: "MultiplicationOperator",
  pattern: Lexer.NA,
} );

export const Star = createToken( {
  name: "Star",
  pattern: /\*/,
  categories: MultiplicationOperator,
} );

export const Not = createToken( {
  name: "Not",
  pattern: /!/,
} );

export const Colon = createToken( {
  name: "Colon",
  pattern: /:/,
} );

export const LParen = createToken( {
  name: "LParen",
  pattern: /\(/,
} );

export const RParen = createToken( {
  name: "RParen",
  pattern: /\)/,
} );

export const LBracket = createToken( {
  name: "LBracket",
  pattern: /\[/,
} );

export const RBracket = createToken( {
  name: "RBracket",
  pattern: /]/,
} );

export const Comma = createToken( {
  name: "Comma",
  pattern: /,/,
} );

export const GreaterEqual = createToken( {
  name: "GreaterEqual",
  pattern: />=/,
} );

export const LessEqual = createToken( {
  name: "LessEqual",
  pattern: /<=/,
} );

export const GreaterThan = createToken( {
  name: "GreaterThan",
  pattern: />/,
} );

export const LessThan = createToken( {
  name: "LessThan",
  pattern: /</,
} );

export const NumberLiteral = createToken( {
  name: "NumberLiteral",
  pattern: /\d+(\.\d+)?/,
} );

export const WeightIdentifier = createToken( {
  name: "Weight",
  pattern: /weight/,
} );

export const YearIdentifier = createToken( {
  name: "Year",
  pattern: /year/,
} );

export const TagIdentifier = createToken( {
  name: "tag",
  pattern: /tag/,
} );

export const StringLiteral = createToken( {
  name: "StringLiteral",
  pattern: /(["']?)([a-zA-Z0-9]+)\1/,
} );

export const WhiteSpace = createToken( {
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
} );

// Tokens y Lexer
export const tokens = [
  WhiteSpace,
  Plus, Star, Minus,
  AdditionOperator, MultiplicationOperator,
  Colon, LParen, RParen, LBracket, RBracket, Comma,
  GreaterEqual, LessEqual, GreaterThan, LessThan,
  NumberLiteral, TagIdentifier, YearIdentifier, WeightIdentifier, StringLiteral,
];

export const QueryLexer = new Lexer(tokens);
