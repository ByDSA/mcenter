import { showError } from "#shared/utils/errors/showError";
import { deepCopy } from "#shared/utils/objects";
import { DateType } from "#shared/utils/time";
import { DateTime } from "luxon";
import { HistoryList } from "./models";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Episode, EpisodeId, compareEpisodeId } from "#episodes/models";
import { EpisodeRepository } from "#episodes/index";

function getTimestampFromDateType(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

type FuncParams = {
  episodeId: EpisodeId;
  entries: HistoryList["entries"];
};

const DEPS_MAP = {
  episodeRepository: EpisodeRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class LastTimePlayedService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  // eslint-disable-next-line require-await
  async updateEpisodeLastTimePlayedFromEntriesAndGet(
    { episodeId, entries }: FuncParams,
  ): Promise<number | null> {
    const lastTimePlayed = this.getLastTimePlayedFromHistory(
      episodeId,
      entries,
    ) ?? undefined;

    this.#deps.episodeRepository.patchOneByIdAndGet(episodeId, {
      lastTimePlayed,
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  getLastTimePlayedFromHistory(selfId: EpisodeId, entries: HistoryList["entries"]): number | null {
    let lastTimePlayed = 0;

    for (const historyEntry of entries) {
      if (compareEpisodeId(historyEntry.episodeId, selfId)) {
        const currentTimestamp = getTimestampFromDateType(historyEntry.date);

        if (currentTimestamp > lastTimePlayed)
          lastTimePlayed = currentTimestamp;
      }
    }

    if (lastTimePlayed === 0)
      return null;

    return lastTimePlayed;
  }

  async getDaysFromLastPlayed(self: Episode, historyList: HistoryList): Promise<number> {
    let lastTimePlayed = self.lastTimePlayed ?? null;

    if (!lastTimePlayed) {
      lastTimePlayed = this.getLastTimePlayedFromHistory(self.id, historyList.entries);

      if (lastTimePlayed) {
        const selfCopy: Episode = {
          ...deepCopy(self),
          lastTimePlayed,
        };
        const { id } = selfCopy;

        await this.#deps.episodeRepository.updateOneByIdAndGet(id, selfCopy);
      }
    }

    if (lastTimePlayed) {
      const now = DateTime.now();
      const lastTimePlayedDate = DateTime.fromSeconds(lastTimePlayed);
      const { days } = now.diff(lastTimePlayedDate, "days");

      return days;
    }

    return Number.MAX_SAFE_INTEGER;
  }
}
