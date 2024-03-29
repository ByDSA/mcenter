import { LastTimePlayedService } from "#modules/historyLists";
import { EpisodeId } from "#shared/models/episodes";
import { PublicMethodsOf } from "#shared/utils/types";

export class LastTimePlayedServiceMock implements PublicMethodsOf<LastTimePlayedService> {
  getDaysFromLastPlayed = jest.fn();

  updateEpisodeLastTimePlayedFromEntriesAndGet = jest.fn();

  getLastTimePlayedFromHistory = jest.fn();
}

export function stringifyEpisodeId(episodeId: EpisodeId): string {
  return `(${episodeId.serieId}; ${episodeId.innerId})`;
}