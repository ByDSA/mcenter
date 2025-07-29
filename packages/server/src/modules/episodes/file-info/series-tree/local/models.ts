import { TreeBranchModel, TreeNodeModel, treePut } from "$shared/utils/trees";

export type EpisodeNode = TreeNodeModel<string, {
  filePath: string;
  episodeKey: string;
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
  seasonKey: SeasonNode["key"];
  seriesKey: SerieNode["key"];
};

export function putEpisodeInSerie(
  { episode, seasonKey }: EpisodeParam,
  serie: SerieNode,
): SerieNode {
  treePut(serie, [seasonKey], episode.key, episode);

  return serie;
}
