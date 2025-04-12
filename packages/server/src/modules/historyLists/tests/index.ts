import { PublicMethodsOf } from "#shared/utils/types";
import { LastTimePlayedService } from "#modules/historyLists";

export class LastTimePlayedServiceMock implements PublicMethodsOf<LastTimePlayedService> {
  getDaysFromLastPlayed = jest.fn();

  updateEpisodeLastTimePlayedFromEntriesAndGet = jest.fn();

  getLastTimePlayedFromHistory = jest.fn();
}
