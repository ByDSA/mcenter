import { Repository as StreamRepository } from "#modules/streams/repositories";
import { SerieId } from "#shared/models/series";
import { LogElementResponse } from "#shared/utils/http";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DepsMap = {
  streamRepository: StreamRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class RelationshipWithStreamFixer {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async fixDefaultStreamForSerie(serieId: SerieId): Promise<LogElementResponse | null> {
    const hasDefault = await this.#deps.streamRepository.hasDefaultForSerie(serieId);

    if (!hasDefault) {
      await this.#deps.streamRepository.createDefaultFromSerie(serieId);

      return {
        message: `Created default stream for serie ${serieId}`,
        type: "StreamCreated",
      };
    }

    return null;
  }
}