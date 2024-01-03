import { EpisodeRepository } from "#modules/episodes";
import { deepCopy } from "#shared/utils/objects";
import { DateType } from "#shared/utils/time";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { DateTime } from "luxon";
import { Model, ModelId, compareId } from "../episodes/models";
import { Model as HistoryList } from "./models";

function getTimestampFromDateType(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

type FuncParams = {
  episodeId: ModelId;
  entries: HistoryList["entries"];
};

const DepsMap = {
  episodeRepository: EpisodeRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class LastTimePlayedService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async updateEpisodeLastTimePlayedFromEntriesAndGet( {episodeId, entries}: FuncParams): Promise<number | null> {
    const lastTimePlayed = this.getLastTimePlayedFromHistory(
      episodeId,
      entries) ?? undefined;

    this.#deps.episodeRepository.patchOneByIdAndGet(episodeId, {
      lastTimePlayed,
    } );

    return lastTimePlayed ?? null;
  }

  getLastTimePlayedFromHistory(selfId: ModelId, entries: HistoryList["entries"]): number | null {
    let lastTimePlayed = 0;

    for (const historyEntry of entries) {
      if (compareId(historyEntry.episodeId, selfId)) {
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
      lastTimePlayed = this.getLastTimePlayedFromHistory(self.id, historyList.entries);

      if (lastTimePlayed) {
        const selfCopy: Model = {
          ...deepCopy(self),
          lastTimePlayed,
        };
        const {id} = selfCopy;

        await this.#deps.episodeRepository.updateOneByIdAndGet(id, selfCopy);
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