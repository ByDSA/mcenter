/* eslint-disable no-use-before-define */

export type ExpressionNode = FilterNode | OperationNode;

type OperationNode = ComplementNode | IntersectionNode | MinusNode | UnionNode;

export type FilterNode = TagNode | WeightNode | YearNode;

export type YearNode = {
  type: "year";
  value: NumberLiteral | RangeNumber;
};

export type WeightNode = {
  type: "weight";
  value: NumberLiteral | RangeNumber;
};

export type TagNode = {
  type: "tag";
  value: string;
};

export type RangeNumber = {
  type: "range";
} & ( {
  max: number;
  maxIncluded: boolean;
} | {
  min: number;
  minIncluded: boolean;
  max: number;
  maxIncluded: boolean;
} | {
  min: number;
  minIncluded: boolean;
} );

export type NumberLiteral = {
  type: "number";
  value: number;
};

type OperationBinaryNode = {
  child1: ExpressionNode;
  child2: ExpressionNode;
};

export type IntersectionNode = OperationBinaryNode & {
  type: "intersection";
};

export type UnionNode = OperationBinaryNode & {
  type: "union";
};

export type DifferenceNode = OperationBinaryNode & {
  type: "difference";
};
type ComplementNode = {
  type: "complement";
  child: ExpressionNode;
};

// Raíz del objeto portable
export interface QueryObject {
  root: ExpressionNode;
}