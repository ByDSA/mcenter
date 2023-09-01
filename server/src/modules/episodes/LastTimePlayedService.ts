import { HistoryList, HistoryListRepository } from "#modules/historyLists";
import { deepCopy } from "#utils/objects";
import { DateType } from "#utils/time";
import { isDefined } from "#utils/validation";
import { DateTime } from "luxon";
import Model, { compareFullId, fullIdOf } from "./models/Episode";
import { Repository } from "./repositories";

function getTimestampFromDateType(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

type HistoryListParam = {
  historyList: HistoryList;
} | {
  historyListRepository: HistoryListRepository;
  streamId: string;
};

type FuncParams = HistoryListParam & {
  episode: Model;
};

type Params = {
  episodeRepository?: Repository;
};
export default class lastTimePlayedService {
  #episodeRepository: Repository;

  constructor( {episodeRepository}: Params = {
  } ) {
    this.#episodeRepository = episodeRepository ?? new Repository();
  }

  async updateEpisodeLastTimePlayedAndGetFromHistoryList( {episode: self, ...otherParams}: FuncParams): Promise<number | null> {
    let historyList: HistoryList | null | undefined;

    if ("historyList" in otherParams)
      historyList = otherParams.historyList;

    if (!historyList)
      return null;

    const lastTimePlayedFromHistory = this.getLastTimePlayedFromHistory(self, historyList);

    if (lastTimePlayedFromHistory === null)
      return null;

    if (isDefined(self.lastTimePlayed) && self.lastTimePlayed === lastTimePlayedFromHistory)
      return self.lastTimePlayed;

    const selfCopy: Model = {
      ...deepCopy(self),
      lastTimePlayed: lastTimePlayedFromHistory,
    };
    const fullId = fullIdOf(selfCopy);

    await this.#episodeRepository.updateOneByIdAndGet(fullId, selfCopy);

    return lastTimePlayedFromHistory;
  }

  getLastTimePlayedFromHistory(self: Model, historyList: HistoryList): number | null {
    let lastTimePlayed = 0;

    for (const historyEntry of historyList.entries) {
      if (self && compareFullId(historyEntry, self)) {
        const currentTimestamp = getTimestampFromDateType(historyEntry.date);

        if (currentTimestamp > lastTimePlayed)
          lastTimePlayed = currentTimestamp;
      }
    }

    if (lastTimePlayed === 0)
      return null;

    return lastTimePlayed;
  }

  // TODO: convertir a async
  getDaysFromLastPlayed(self: Model, historyList: HistoryList): number {
    let lastTimePlayed = self.lastTimePlayed ?? null;

    if (!lastTimePlayed) {
      lastTimePlayed = this.getLastTimePlayedFromHistory(self, historyList);

      if (lastTimePlayed) {
        const selfCopy: Model = {
          ...deepCopy(self),
          lastTimePlayed,
        };
        const fullId = fullIdOf(selfCopy);

        this.#episodeRepository.updateOneByIdAndGet(fullId, selfCopy);
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