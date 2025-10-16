/* eslint-disable accessor-pairs */
import { DependencyFilter, FilterApplier, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { Episode, EpisodeCompKey, EpisodeEntity, compareEpisodeCompKey } from "../../episodes/models";
import { DependenciesList } from "./dependencies";

class PreventDisabledEpisodeFilter extends PreventDisabledFilter<EpisodeEntity> {
  isDisabled(resource: EpisodeEntity): boolean {
    return !!resource.disabled;
  }
}

class RemoveWeightLowerOrEqualThanEpisodeFilter
  extends RemoveWeightLowerOrEqualThanFilter<EpisodeEntity> {
  getWeight(resource: EpisodeEntity): number {
    return resource.weight;
  }
}

class PreventRepeatInDaysEpisodeFilter extends PreventRepeatInDaysFilter<EpisodeEntity> {
  getLastTimePlayed(resource: EpisodeEntity): number {
    return resource.lastTimePlayed ?? 0;
  }
}

type Params<R, ID = string> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
  dependencies: DependenciesList;
};
export class EpisodeFilterApplier extends FilterApplier<EpisodeEntity> {
  #params: Params<EpisodeEntity, EpisodeCompKey>;

  constructor(params: Params<EpisodeEntity, EpisodeCompKey>) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  get resources() {
    return this.#params.resources;
  }

  get dependencies() {
    return this.#params.dependencies;
  }

  #addDependencyFilter(): boolean {
    const { dependencies, lastId } = this.#params;
    const seriesKey = lastId?.seriesKey;

    if (lastId && seriesKey && seriesKey in dependencies) {
      const serieDependencies = dependencies[seriesKey];
      const dependency = serieDependencies.find(([a]) => a === lastId.episodeKey);

      if (dependency) {
        const dependencyFullId: [EpisodeCompKey, EpisodeCompKey] = dependency
          .map((episodeKey) => ( {
            episodeKey: episodeKey,
            seriesKey: seriesKey,
          } )) as [EpisodeCompKey, EpisodeCompKey];

        this.add(new DependencyFilter<EpisodeCompKey, EpisodeEntity>( {
          lastId,
          firstId: dependencyFullId[0],
          secondId: dependencyFullId[1],
          compareId: compareEpisodeCompKey,
          getId: (e)=>e.compKey,
        } ));

        return true;
      }
    }

    return false;
  }

  #createFilters(): void {
    const { PICKER_MIN_WEIGHT = -99, PICKER_MIN_DAYS = 0 } = process.env;
    const { lastEp, lastId } = this.#params;
    const addedDependencyFilter = this.#addDependencyFilter();

    if (addedDependencyFilter)
      return;

    this.add(new PreventDisabledEpisodeFilter());

    if (lastEp) {
      this.add(new PreventRepeatLastFilter<EpisodeCompKey, Episode>(
        {
          lastId,
          compareId: compareEpisodeCompKey,
          getResourceId: e=>e.compKey,
        },
      ));
    }

    this.add(new RemoveWeightLowerOrEqualThanEpisodeFilter(+PICKER_MIN_WEIGHT));

    this.add(new PreventRepeatInDaysEpisodeFilter( {
      minDays: +PICKER_MIN_DAYS,
    } ));
  }
}

export function genEpisodeFilterApplier(
  resources: EpisodeEntity[],
  deps: DependenciesList,
  lastEp?: EpisodeEntity,
) {
  return new EpisodeFilterApplier( {
    resources,
    lastEp: lastEp ?? null,
    lastId: lastEp?.compKey,
    dependencies: deps,
  } );
}
