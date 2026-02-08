/* eslint-disable accessor-pairs */
import { DependencyFilter, FilterApplier, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { EpisodeEntity, EpisodeEntityWithUserInfo } from "../../../models";
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

type Params<R, ID = string> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
  dependencies: DependenciesList;
};
export class EpisodeFilterApplier extends FilterApplier<EpisodeEntityWithUserInfo> {
  #params: Params<EpisodeEntityWithUserInfo, string>;

  constructor(params: Params<EpisodeEntityWithUserInfo, string>) {
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
        compareId: (a, b)=>a === b,
        getId: (e)=>e.id,
      } ));

      return true;
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
      this.add(new PreventRepeatLastFilter<string, EpisodeEntity>(
        {
          lastId,
          compareId: (a, b)=>a === b,
          getResourceId: e=>e.id,
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
  resources: EpisodeEntityWithUserInfo[],
  deps: DependenciesList,
  lastEp?: EpisodeEntityWithUserInfo,
) {
  return new EpisodeFilterApplier( {
    resources,
    lastEp: lastEp ?? null,
    lastId: lastEp?.id,
    dependencies: deps,
  } );
}
