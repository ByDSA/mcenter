import { TreeBranchModel, TreeNodeModel, treePut } from "$shared/utils/trees";

export type EpisodeNode = TreeNodeModel<string, {
  filePath: string;
  episodeKey: string;
}>;

export type SeasonNode = TreeBranchModel<string, EpisodeNode> & {
  children: EpisodeNode[];
};

export type SeriesNode = TreeBranchModel<string, EpisodeNode> & {
  children: SeasonNode[];
};

export type SerieTree = {
  children: SeriesNode[];
};

type EpisodeParam = {
  episode: EpisodeNode;
  seasonKey: SeasonNode["key"];
  seriesKey: SeriesNode["key"];
};

export function putEpisodeInSerie(
  { episode, seasonKey }: EpisodeParam,
  series: SeriesNode,
): SeriesNode {
  treePut(series, [seasonKey], episode.key, episode);

  return series;
}
