import { TreeBranchModel, treePut } from "./model";

const SEPARATOR = "/";

export interface Tree<ID, C> {
  put(branches: ID[], key: ID, content: C): void;
  get(branches: ID[]): C | null;
  getRootNode(): TreeBranchModel<ID, C>;
}

type TreeMapId = string;
export abstract class TreeMap<C> implements Tree<TreeMapId, C> {
  #rootNode: TreeBranchModel<TreeMapId, C>;

  #branchesMap: { [key: string]: C } = {};

  #contentMap: { [key: TreeMapId]: C[] } = {};

  constructor(root: C) {
    this.#rootNode = {
      key: this.getIdFromContent(root),
      children: [],
    };
  }

  getRootNode(): TreeBranchModel<TreeMapId, C> {
    return this.#rootNode;
  }

  put(branches: TreeMapId[], key: TreeMapId, content: C): void {
    treePut(this.#rootNode, branches, key, content);
    const pathId = this.#getPathId(...branches, key);

    this.#branchesMap[pathId] = content;

    this.#contentMapPut(key, content);
  }

  #getPathId(...branches: TreeMapId[]): string {
    return branches.join(SEPARATOR);
  }

  #contentMapPut(key: TreeMapId, content: C): void {
    if (!this.#contentMap[key])
      this.#contentMap[key] = [];

    this.#contentMap[key].push(content);
  }

  get(branches: TreeMapId[]): C | null {
    const pathId = this.#getPathId(...branches);
    const currentNode = this.#branchesMap[pathId];

    return currentNode ?? null;
  }

  abstract getIdFromContent(content: C): TreeMapId;
}

export {
  TreeBranchModel,
  TreeModel, TreeNodeModel, treePut,
} from "./model";
