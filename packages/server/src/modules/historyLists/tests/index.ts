import { LastTimePlayedService } from "#modules/historyLists";
import { PublicMethodsOf } from "$shared/utils/types";

export class LastTimePlayedServiceMock implements PublicMethodsOf<LastTimePlayedService> {
  getDaysFromLastPlayed = jest.fn();

  updateEpisodeLastTimePlayedFromEntriesAndGet = jest.fn();

  getLastTimePlayedFromHistory = jest.fn();
}
