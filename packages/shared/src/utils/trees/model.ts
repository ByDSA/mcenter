type TreeCommonModel<ID> = {
  id: ID;
};

export type TreeNodeModel<ID, C> = TreeCommonModel<ID> & {
  content: C;
};

type TreeRootModel<ID, C> = {
  // eslint-disable-next-line no-use-before-define
  children: (TreeBranchModel<ID, C> | TreeNodeModel<ID, C>)[];
};

export type TreeBranchModel<ID, C> = TreeCommonModel<ID> & TreeRootModel<ID, C>;

export type TreeModel<ID, C> = TreeBranchModel<ID, C> | TreeNodeModel<ID, C>;

export function treePut<ID, C>(
  tree: TreeRootModel<ID, C>,
  branches: ID[],
  key: ID,
  content: C,
): void {
  const parentBranch: TreeBranchModel<ID, C> = treeGetOrCreateBranches(tree, branches);
  const currentNode: TreeNodeModel<ID, C> = {
    id: key,
    content,
  };

  parentBranch.children.push(currentNode);
}

function treeGetOrCreateBranches<ID, C>(
  tree: TreeRootModel<ID, C>,
  branches: ID[],
): TreeBranchModel<ID, C> {
  let currentBranch = tree;

  for (const branchName of branches) {
    let nextBranch = currentBranch.children.find((node) => node.id === branchName);

    if (nextBranch && !("children" in nextBranch))
      throw new Error(`The branch ${branchName} is already a leaf`);

    if (!nextBranch) {
      nextBranch = {
        id: branchName,
        children: [],
      };
      currentBranch.children.push(nextBranch);
    }

    currentBranch = nextBranch;
  }

  return currentBranch as TreeBranchModel<ID, C>;
}
