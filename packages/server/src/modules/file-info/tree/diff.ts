import { treePut } from "#shared/utils/trees";
import { Episode, Season, Serie, SerieTree } from "./models";

export type OldNew = {
  old: Episode;
  new: Episode;
};
type Return = {
  removed: SerieTree;
  new: SerieTree;
  both: SerieTree;
  moved: OldNew[];
  updated: OldNew[];
};
export default function diff(tree1: SerieTree, tree2: SerieTree): Return {
  const removed: SerieTree = {
    children: [],
  };
  const news: SerieTree = {
    children: [],
  };
  const updated: OldNew[] = [];
  const both: SerieTree = {
    children: [],
  };
  const moved: OldNew[] = [];
  const {branchesMap: tree1BranchesMap, contentMap: tree1ContentMap } = plainTreeMaps(tree1);
  const {branchesMap: tree2BranchesMap, contentMap: tree2ContentMap } = plainTreeMaps(tree2);
  // eslint-disable-next-line no-use-before-define
  const compareContentNode = (node1: TreeNode, node2: TreeNode) => node1.content.filePath === node2.content.filePath;

  for (const [branches, plainTreeEntry] of Object.entries(tree1BranchesMap)) {
    const branchesArray = branches.split("/");
    const serieId = branchesArray[0];
    const seasonId = branchesArray[1];

    if (tree2BranchesMap[branches] === undefined) { // si no está en el mismo sitio en el nuevo
      if (tree2ContentMap[plainTreeEntry.content.filePath] === undefined) // ni el filePath lo tiene otro nodo
        treePut(removed, [serieId, seasonId], plainTreeEntry.id, plainTreeEntry.content); // se ha eliminado
      else {
        moved.push( { // se ha movido
          old: plainTreeEntry,
          new: tree2ContentMap[plainTreeEntry.content.filePath],
        } );
      }
    } else if (compareContentNode(tree2BranchesMap[branches], plainTreeEntry)) // si está en ambos sitios y son iguales en contenido
      treePut(both, [serieId, seasonId], plainTreeEntry.id, plainTreeEntry.content);
    else { // si está en ambos sitios y son diferentes en contenido
      updated.push( {
        old: plainTreeEntry,
        new: tree2BranchesMap[branches],
      } );
    }
  }

  for (const [branches, plainTreeEntry] of Object.entries(tree2BranchesMap)) {
    if (tree1BranchesMap[branches] === undefined && tree1ContentMap[plainTreeEntry.content.filePath] === undefined) {
      const branchesArray = branches.split("/");
      const serieId = branchesArray[0];
      const seasonId = branchesArray[1];

      treePut(news, [serieId, seasonId], plainTreeEntry.id, plainTreeEntry.content);
    }
  }

  return {
    removed,
    new: news,
    both,
    moved,
    updated,
  };
}

type Hash = string;
type Branches = [Serie["id"], Season["id"], Episode["id"]];
type TreeNode = Episode;
function plainTreeMaps(serieTree: SerieTree) {
  const branchesMap: {[key: string]: TreeNode} = {
  };
  const contentMap: {[key: Hash]: TreeNode} = {
  };

  for (const serie of serieTree.children) {
    for (const season of serie.children) {
      for (const episode of season.children) {
        const branches: Branches = [serie.id, season.id, episode.id];
        const key = branches.join("/");

        branchesMap[key] = episode;

        const hash = episode.content.filePath;

        contentMap[hash] = episode;
      }
    }
  }

  return {
    branchesMap,
    contentMap,
  };
}