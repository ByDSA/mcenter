type TreeCommonModel<K> = {
  key: K;
};

export type TreeNodeModel<K, C> = TreeCommonModel<K> & {
  content: C;
};

type TreeRootModel<K, C> = {

  children: (TreeBranchModel<K, C> | TreeNodeModel<K, C>)[];
};

export type TreeBranchModel<K, C> = TreeCommonModel<K> & TreeRootModel<K, C>;

export type TreeModel<K, C> = TreeBranchModel<K, C> | TreeNodeModel<K, C>;

export function treePut<K, C>(
  tree: TreeRootModel<K, C>,
  branches: K[],
  key: K,
  content: C,
): void {
  const parentBranch: TreeBranchModel<K, C> = treeGetOrCreateBranches(tree, branches);
  const currentNode: TreeNodeModel<K, C> = {
    key: key,
    content,
  };

  parentBranch.children.push(currentNode);
}

function treeGetOrCreateBranches<K, C>(
  tree: TreeRootModel<K, C>,
  branches: K[],
): TreeBranchModel<K, C> {
  let currentBranch = tree;

  for (const branchName of branches) {
    let nextBranch = currentBranch.children.find((node) => node.key === branchName);

    if (nextBranch && !("children" in nextBranch))
      throw new Error(`The branch ${branchName} is already a leaf`);

    if (!nextBranch) {
      nextBranch = {
        key: branchName,
        children: [],
      };
      currentBranch.children.push(nextBranch);
    }

    currentBranch = nextBranch;
  }

  return currentBranch as TreeBranchModel<K, C>;
}
