import { ResourceVO } from "#shared/models/resource";
import { Model, ModelId, compareId } from "../../episodes/models";
import { DependenciesList } from "./Dependencies";
import { DependencyFilter, FilterApplier, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";

type Params<R extends ResourceVO = ResourceVO, ID = string> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
  dependencies: DependenciesList;
};
export default class EpisodeFilterApplier extends FilterApplier<Model> {
  #params: Params<Model, ModelId>;

  constructor(params: Params<Model, ModelId>) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  #addDependencyFilter(): boolean {
    const { dependencies, lastId } = this.#params;
    const serieId = lastId?.serieId;

    if (lastId && serieId && serieId in dependencies) {
      const serieDependencies = dependencies[serieId];
      const dependency = serieDependencies.find(([a]) => a === lastId.innerId);

      if (dependency) {
        const dependencyFullId: [ModelId, ModelId] = dependency.map((episodeId) => ( {
          innerId: episodeId,
          serieId,
        } )) as [ModelId, ModelId];

        this.add(new DependencyFilter<ModelId, Model>( {
          lastId,
          firstId: dependencyFullId[0],
          secondId: dependencyFullId[1],
          compareId,
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
          compareId,
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
  resources: Model[],
  deps: DependenciesList,
  lastEp?: Model,
) {
  return new EpisodeFilterApplier( {
    resources,
    lastEp: lastEp ?? null,
    lastId: lastEp?.id,
    dependencies: deps,
  } );
}
