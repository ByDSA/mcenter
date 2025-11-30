export type ExpressionNode = FilterNode | OperationNode;

export type OperationNode = BinaryOperationNode | NegationNode;

export type BinaryOperationNode = AdditionNode | MultiplicationNode;

export type MultiplicationNode = IntersectionNode;

export type AdditionNode = DifferenceNode | UnionNode;

export type FilterNode = AddedNode | PlayedNode | PrivatePlaylistNode | PublicPlaylistNode |
  TagNode | WeightNode | YearNode;

export type YearNode = {
  type: "year";
  value: NumberLiteral | RangeNumber;
};

export type PlayedNode = {
  type: "played";
  value: RangeDate;
};

export type AddedNode = Omit<PlayedNode, "type"> & {
  type: "added";
};

export type WeightNode = {
  type: "weight";
  value: NumberLiteral | RangeNumber;
};

export type TagNode = {
  type: "tag";
  value: string;
};

export type PrivatePlaylistNode = {
  type: "privatePlaylist";
  value: string;
};

export type PublicPlaylistNode = {
  type: "publicPlaylist";
  user: string;
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

export type RangeDate = {
  type: "range-date";
} & ( {
  max: Date;
  maxIncluded: boolean;
} | {
  min: Date;
  minIncluded: boolean;
  max: Date;
  maxIncluded: boolean;
} | {
  min: Date;
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

export type NegationNode = {
  type: "negation";
  child: ExpressionNode;
};

// Raíz del objeto portable
export interface QueryObject {
  root: ExpressionNode;
}
