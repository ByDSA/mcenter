import { TreeBranchModel, TreeNodeModel, treePut } from "$shared/utils/trees";

export type EpisodeNode = TreeNodeModel<string, {
  filePath: string;
  episodeId: string;
}>;

export type SeasonNode = TreeBranchModel<string, EpisodeNode> & {
  children: EpisodeNode[];
};

export type SerieNode = TreeBranchModel<string, EpisodeNode> & {
  children: SeasonNode[];
};

export type SerieTree = {
  children: SerieNode[];
};

type EpisodeParam = {
  episode: EpisodeNode;
  seasonId: SeasonNode["id"];
  serieId: SerieNode["id"];
};

export function putEpisodeInSerie(
  { episode, seasonId }: EpisodeParam,
  serie: SerieNode,
): SerieNode {
  treePut(serie, [seasonId], episode.id, episode);

  return serie;
}
