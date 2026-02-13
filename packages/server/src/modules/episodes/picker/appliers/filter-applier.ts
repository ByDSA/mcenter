/* eslint-disable accessor-pairs */
import { EpisodeEntityWithUserInfo, EpisodeEntity } from "#episodes/models";
import { DependencyFilter, FilterApplier, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { DependenciesList } from "./dependencies";

class PreventDisabledEpisodeFilter extends PreventDisabledFilter<EpisodeEntityWithUserInfo> {
  isDisabled(resource: EpisodeEntityWithUserInfo): boolean {
    return !!resource.disabled;
  }
}

class RemoveWeightLowerOrEqualThanEpisodeFilter
  extends RemoveWeightLowerOrEqualThanFilter<EpisodeEntityWithUserInfo> {
  getWeight(resource: EpisodeEntityWithUserInfo): number {
    return resource.userInfo.weight;
  }
}

class PreventRepeatInDaysEpisodeFilter
  extends PreventRepeatInDaysFilter<EpisodeEntityWithUserInfo> {
  getLastTimePlayed(resource: EpisodeEntityWithUserInfo): Date | null {
    return resource.userInfo.lastTimePlayed;
  }
}

type Params<R> = {
  resources: R[];
  lastId: string | null;
  dependencies: DependenciesList;
};
export class EpisodeFilterApplier extends FilterApplier<EpisodeEntityWithUserInfo> {
  #params: Params<EpisodeEntityWithUserInfo>;

  constructor(params: Params<EpisodeEntityWithUserInfo>) {
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
    const plainDependencies = Object.values(dependencies).flat();
    const dependency = plainDependencies.find((d) => d.lastEpisodeId === lastId);

    if (dependency) {
      this.add(new DependencyFilter<string, EpisodeEntityWithUserInfo>( {
        lastId: lastId ?? null,
        firstId: dependency.lastEpisodeId,
        secondId: dependency.nextEpisodeId,
        getId: (e)=>e.id,
      } ));

      return true;
    }

    return false;
  }

  #createFilters(): void {
    const { PICKER_MIN_WEIGHT = -99, PICKER_MIN_DAYS = 0 } = process.env;
    const { lastId } = this.#params;
    const addedDependencyFilter = this.#addDependencyFilter();

    if (addedDependencyFilter)
      return;

    this.add(new PreventDisabledEpisodeFilter());

    if (lastId) {
      this.add(new PreventRepeatLastFilter<EpisodeEntity>(
        {
          lastId,
          getId: e=>e.id,
        },
      ));
    }

    this.add(new RemoveWeightLowerOrEqualThanEpisodeFilter(+PICKER_MIN_WEIGHT));

    this.add(new PreventRepeatInDaysEpisodeFilter( {
      minDays: +PICKER_MIN_DAYS,
    } ));
  }
}
