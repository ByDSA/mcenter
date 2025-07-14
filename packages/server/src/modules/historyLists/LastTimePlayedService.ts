import { DateTime } from "luxon";
import { Injectable } from "@nestjs/common";
import { DateType } from "$shared/utils/time";
import { deepCopy } from "$shared/utils/objects";
import { showError } from "$shared/utils/errors/showError";
import { EpisodeEntity, EpisodeId, compareEpisodeId } from "#episodes/models";
import { EpisodeRepository } from "#episodes/index";
import { HistoryListEntity } from "./models";

function getTimestampFromDateType(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

type FuncParams = {
  episodeId: EpisodeId;
  entries: HistoryListEntity["entries"];
};

@Injectable()
export class LastTimePlayedService {
  constructor(private episodeRepository: EpisodeRepository) {
  }

  // eslint-disable-next-line require-await
  async updateEpisodeLastTimePlayedFromEntriesAndGet(
    { episodeId, entries }: FuncParams,
  ): Promise<number | null> {
    const lastTimePlayed = this.getLastTimePlayedFromHistory(
      episodeId,
      entries,
    ) ?? undefined;

    this.episodeRepository.patchOneByIdAndGet(episodeId, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  getLastTimePlayedFromHistory(selfId: EpisodeId, entries: HistoryListEntity["entries"]): number | null {
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

  async getDaysFromLastPlayed(
    self: EpisodeEntity,
    historyList: HistoryListEntity,
  ): Promise<number> {
    let lastTimePlayed = self.lastTimePlayed ?? null;

    if (!lastTimePlayed) {
      lastTimePlayed = this.getLastTimePlayedFromHistory(self.id, historyList.entries);

      if (lastTimePlayed) {
        const selfCopy: EpisodeEntity = {
          ...deepCopy(self),
          lastTimePlayed,
        };
        const { id } = selfCopy;

        await this.episodeRepository.updateOneByIdAndGet(id, selfCopy);
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
