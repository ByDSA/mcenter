import { createToken, Lexer } from "chevrotain";

// Definición de tokens
export const additionOperator = createToken( {
  name: "AdditionOperator",
  pattern: Lexer.NA,
} );

export const plus = createToken( {
  name: "Or",
  pattern: /\+|\|/,
  categories: additionOperator,
} );

export const minus = createToken( {
  name: "Minus",
  pattern: /-/,
  categories: additionOperator,
} );

export const multiplicationOperator = createToken( {
  name: "MultiplicationOperator",
  pattern: Lexer.NA,
} );

export const star = createToken( {
  name: "Star",
  pattern: /\*/,
  categories: multiplicationOperator,
} );

export const not = createToken( {
  name: "Not",
  pattern: /!/,
} );

export const colon = createToken( {
  name: "Colon",
  pattern: /:/,
} );

export const lParen = createToken( {
  name: "LParen",
  pattern: /\(/,
} );

export const rParen = createToken( {
  name: "RParen",
  pattern: /\)/,
} );

export const lBracket = createToken( {
  name: "LBracket",
  pattern: /\[/,
} );

export const rBracket = createToken( {
  name: "RBracket",
  pattern: /]/,
} );

export const comma = createToken( {
  name: "Comma",
  pattern: /,/,
} );

export const greaterEqual = createToken( {
  name: "GreaterEqual",
  pattern: />=/,
} );

export const lessEqual = createToken( {
  name: "LessEqual",
  pattern: /<=/,
} );

export const greaterThan = createToken( {
  name: "GreaterThan",
  pattern: />/,
} );

export const lessThan = createToken( {
  name: "LessThan",
  pattern: /</,
} );

export const numberLiteral = createToken( {
  name: "NumberLiteral",
  pattern: /\d+(\.\d+)?/,
} );

export const isoDateLiteral = createToken( {
  name: "ISODate",
  pattern: /\d{4}-\d{2}-\d{2}/,
} );

export const weightIdentifier = createToken( {
  name: "Weight",
  pattern: /weight/,
} );

export const yearIdentifier = createToken( {
  name: "Year",
  pattern: /year/,
} );

export const playedIdentifier = createToken( {
  name: "Played",
  pattern: /played/,
} );

export const addedIdentifier = createToken( {
  name: "Added",
  pattern: /added/,
} );

export const tagIdentifier = createToken( {
  name: "tag",
  pattern: /tag/,
} );

export const playlistIdentifier = createToken( {
  name: "Playlist",
  pattern: /playlist/,
} );

export const stringLiteral = createToken( {
  name: "StringLiteral",
  // eslint-disable-next-line no-control-regex
  pattern: /(?:["'?!#a-zA-Z0-9._~-]|[^\x00-\x7F])+/,
} );

const slugPattern = /(?:[a-zA-Z0-9-])+/;

export const privatePlaylistLiteral = createToken( {
  name: "PrivatePlaylistLiteral",
  pattern: slugPattern,
} );

export const publicPlaylistLiteral = createToken( {
  name: "PublicPlaylistLiteral",
  pattern: new RegExp(`@${slugPattern.source}\\/${slugPattern.source}`),
} );

export const relativeDateLiteral = createToken( {
  name: "RelativeDateString",
  pattern: /\d+(\.\d+)?(y|m|w|d)/,
  // eslint-disable-next-line camelcase
  longer_alt: stringLiteral, // esto le da prioridad sobre StringLiteral
} );

export const whiteSpace = createToken( {
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
} );

// Tokens y Lexer
export const tokens = [
  whiteSpace,
  plus, star, minus,
  additionOperator, multiplicationOperator,
  colon, lParen, rParen, lBracket, rBracket, comma,
  greaterEqual, lessEqual, greaterThan, lessThan,
  relativeDateLiteral, isoDateLiteral,
  tagIdentifier, yearIdentifier, playedIdentifier, addedIdentifier, weightIdentifier,
  playlistIdentifier, numberLiteral, publicPlaylistLiteral, privatePlaylistLiteral, stringLiteral,
];

export const queryLexer = new Lexer(tokens);
