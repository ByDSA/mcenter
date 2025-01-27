type Entry = {
  description: string;
  value: any;
};

const NUMBER_0_ENTRY: Entry = {
  description: "number 0",
  value: 0,
};
const NUMBER_1_ENTRY: Entry = {
  description: "number 1",
  value: 1,
};
const NUMBER_NAN_ENTRY: Entry = {
  description: "number NaN",
  value: NaN,
};
const NUMBER_INFINITY_ENTRY: Entry = {
  description: "number Infinity",
  value: Infinity,
};
const NUMBER_MINUS_1_ENTRY: Entry = {
  description: "number -1",
  value: -1,
};
const STRING_EMPTY_ENTRY: Entry = {
  description: "string empty",
  value: "",
};
const BOOLEAN_FALSE_ENTRY: Entry = {
  description: "boolean false",
  value: false,
};
const BOOLEAN_TRUE_ENTRY: Entry = {
  description: "boolean true",
  value: true,
};
const STRING_A_ENTRY: Entry = {
  description: "string a",
  value: "a",
};
const STRING_0_ENTRY: Entry = {
  description: "string 0",
  value: "0",
};
const ARRAY_EMPTY_ENTRY: Entry = {
  description: "empty array",
  value: [],
};
const OBJECT_EMPTY_ENTRY: Entry = {
  description: "empty object",
  value: {},
};
const FUNCTION_ENTRY: Entry = {
  description: "function",
  // eslint-disable-next-line no-empty-function
  value: () => { },
};
const DATE_ENTRY: Entry = {
  description: "date",
  value: new Date(),
};
const REGEX_ENTRY: Entry = {
  description: "regex",
  value: /(?:)/,
};
const MAP_ENTRY: Entry = {
  description: "map",
  value: new Map(),
};
const SET_ENTRY: Entry = {
  description: "set",
  value: new Set(),
};
const NULL_ENTRY: Entry = {
  description: "null",
  value: null,
};
const UNDEFINED_ENTRY: Entry = {
  description: "undefined",
  value: undefined,
};
const SYMBOL_ENTRY: Entry = {
  description: "symbol",

  value: Symbol(),
};

export const undefinedEntries: Entry[] = [
  NULL_ENTRY,
  UNDEFINED_ENTRY,
];

export const falsyButDefinedEntries: Entry[] = [
  NUMBER_0_ENTRY,
  NUMBER_MINUS_1_ENTRY,
  NUMBER_NAN_ENTRY,
  STRING_EMPTY_ENTRY,
  BOOLEAN_FALSE_ENTRY,
];

export const falsyEntries: Entry[] = [
  ...falsyButDefinedEntries,
  ...undefinedEntries,
];

export const truthyEntries: Entry[] = [
  NUMBER_1_ENTRY,
  STRING_A_ENTRY,
  NUMBER_INFINITY_ENTRY,
  STRING_0_ENTRY,
  BOOLEAN_TRUE_ENTRY,
  ARRAY_EMPTY_ENTRY,
  OBJECT_EMPTY_ENTRY,
  FUNCTION_ENTRY,
  DATE_ENTRY,
  REGEX_ENTRY,
  MAP_ENTRY,
  SET_ENTRY,
  SYMBOL_ENTRY,
];

export const definedEntries: Entry[] = [
  ...truthyEntries,
  ...falsyButDefinedEntries,
];
