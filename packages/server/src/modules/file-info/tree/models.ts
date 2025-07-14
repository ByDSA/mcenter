import { TreeBranchModel, TreeNodeModel, treePut } from "$shared/utils/trees";

export type Episode = TreeNodeModel<string, {
  filePath: string;
  episodeId: string;
}>;

export type Season = TreeBranchModel<string, Episode> & {
  children: Episode[];
};

export type Serie = TreeBranchModel<string, Episode> & {
  children: Season[];
};

export type SerieTree = {
  children: Serie[];
};

type EpisodeParam = {
  episode: Episode;
  seasonId: Season["id"];
  serieId: Serie["id"];
};

export function putEpisodeInSerie( { episode, seasonId }: EpisodeParam, serie: Serie): Serie {
  treePut(serie, [seasonId], episode.id, episode);

  return serie;
}
