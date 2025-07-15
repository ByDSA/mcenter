import { DependencyFilter, FilterApplier, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { Resource } from "#modules/resources/models";
import { EpisodeEntity, EpisodeId, compareEpisodeId } from "../../episodes/models";
import { DependenciesList } from "./Dependencies";

type Params<R extends Resource = Resource, ID = string> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
  dependencies: DependenciesList;
};
export class EpisodeFilterApplier extends FilterApplier<EpisodeEntity> {
  #params: Params<EpisodeEntity, EpisodeId>;

  constructor(params: Params<EpisodeEntity, EpisodeId>) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  #addDependencyFilter(): boolean {
    const { dependencies, lastId } = this.#params;
    const serieId = lastId?.serieId;

    if (lastId && serieId && serieId in dependencies) {
      const serieDependencies = dependencies[serieId];
      const dependency = serieDependencies.find(([a]) => a === lastId.code);

      if (dependency) {
        const dependencyFullId: [EpisodeId, EpisodeId] = dependency.map((episodeId) => ( {
          code: episodeId,
          serieId,
        } )) as [EpisodeId, EpisodeId];

        this.add(new DependencyFilter<EpisodeId, EpisodeEntity>( {
          lastId,
          firstId: dependencyFullId[0],
          secondId: dependencyFullId[1],
          compareId: compareEpisodeId,
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

    this.add(new PreventDisabledFilter());

    if (lastEp) {
      this.add(new PreventRepeatLastFilter(
        {
          lastId,
          compareId: compareEpisodeId,
        },
      ));
    }

    this.add(new RemoveWeightLowerOrEqualThanFilter(+PICKER_MIN_WEIGHT));

    this.add(new PreventRepeatInDaysFilter( {
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
    lastId: lastEp?.id,
    dependencies: deps,
  } );
}
