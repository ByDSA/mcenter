import type { SeriesKey } from "#series/models";
import { EpisodeDependency } from "#episodes/dependencies/models";

export type DependenciesList = {[key: SeriesKey]: [string, string][]};

export function dependenciesToList(dependencies: EpisodeDependency[]) {
  return dependencies.reduce((acc, d)=> {
    const { seriesKey: s } = d.lastCompKey;

    acc[s] ??= [];

    acc[s].push([d.lastCompKey.episodeKey, d.nextCompKey.episodeKey]);

    return acc;
  }, {} as DependenciesList);
}
