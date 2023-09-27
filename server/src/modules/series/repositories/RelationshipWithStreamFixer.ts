import { StreamRepository } from "#modules/streams";
import { SerieId } from "#shared/models/series";
import { LogElementResponse } from "#shared/utils/http";

type Params = {
  streamRepository: StreamRepository;
};
export default class RelationshipWithStreamFixer {
  #streamRepository: StreamRepository;

  constructor( {streamRepository}: Params) {
    this.#streamRepository = streamRepository;
  }

  async fixDefaultStreamForSerie(serieId: SerieId): Promise<LogElementResponse | null> {
    const streamOdm = await this.#streamRepository.hasDefaultForSerie(serieId);

    if (!streamOdm) {
      await this.#streamRepository.createDefaultFromSerie(serieId);

      return {
        message: `Created default stream for serie ${serieId}`,
        type: "StreamCreated",
      };
    }

    return null;
  }
}