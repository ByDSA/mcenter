import { DomainMessageBroker } from "#modules/domain-message-broker";
import { HistoryList } from "#modules/historyLists";
import { deepCopy } from "#shared/utils/objects";
import { DateType } from "#shared/utils/time";
import { DateTime } from "luxon";
import { Model, ModelFullId, compareFullId, fullIdOf } from "./models";
import { Repository } from "./repositories";

function getTimestampFromDateType(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

type FuncParams = {
  episodeFullId: ModelFullId;
  entries: HistoryList["entries"];
};

type Params = {
  episodeRepository: Repository;
  domainMessageBroker: DomainMessageBroker;
};
export default class lastTimePlayedService {
  #episodeRepository: Repository;

  constructor( {episodeRepository, domainMessageBroker}: Params) {
    this.#episodeRepository = episodeRepository ?? new Repository( {
      domainMessageBroker,
    } );
  }

  async updateEpisodeLastTimePlayedFromEntriesAndGet( {episodeFullId, entries}: FuncParams): Promise<number | null> {
    const {episodeId, serieId} = episodeFullId;
    const fullId = {
      episodeId,
      serieId,
    };
    const lastTimePlayed = this.getLastTimePlayedFromHistory(
      fullId,
      entries) ?? undefined;

    this.#episodeRepository.patchOneByIdAndGet(fullId, {
      lastTimePlayed,
    } );

    return lastTimePlayed ?? null;
  }

  getLastTimePlayedFromHistory(selfId: ModelFullId, entries: HistoryList["entries"]): number | null {
    let lastTimePlayed = 0;

    for (const historyEntry of entries) {
      if (compareFullId(historyEntry, selfId)) {
        const currentTimestamp = getTimestampFromDateType(historyEntry.date);

        if (currentTimestamp > lastTimePlayed)
          lastTimePlayed = currentTimestamp;
      }
    }

    if (lastTimePlayed === 0)
      return null;

    return lastTimePlayed;
  }

  async getDaysFromLastPlayed(self: Model, historyList: HistoryList): Promise<number> {
    let lastTimePlayed = self.lastTimePlayed ?? null;

    if (!lastTimePlayed) {
      lastTimePlayed = this.getLastTimePlayedFromHistory(self, historyList.entries);

      if (lastTimePlayed) {
        const selfCopy: Model = {
          ...deepCopy(self),
          lastTimePlayed,
        };
        const fullId = fullIdOf(selfCopy);

        await this.#episodeRepository.updateOneByIdAndGet(fullId, selfCopy);
      }
    }

    if (lastTimePlayed) {
      const now = DateTime.now();
      const lastTimePlayedDate = DateTime.fromSeconds(lastTimePlayed);
      const {days} = now.diff(lastTimePlayedDate, "days");

      return days;
    }

    return Number.MAX_SAFE_INTEGER;
  }
}