import { HistoryList } from "#modules/historyLists";
import { DateType } from "#utils/time";
import { DateTime } from "luxon";
import Model, { compareFullId, copyOf, fullIdOf } from "./models/Episode";
import { Repository } from "./repositories";

function getTimestampFromDate(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

export function getLastTimePlayedFromHistory(self: Model, historyList: HistoryList): number | null {
  let lastTimePlayed = Number.MAX_SAFE_INTEGER;

  for (const historyEntry of historyList.entries) {
    if (self && compareFullId(historyEntry, self)) {
      const currentTimestamp = getTimestampFromDate(historyEntry.date);

      if (currentTimestamp < lastTimePlayed)
        lastTimePlayed = currentTimestamp;
    }
  }

  if (lastTimePlayed === Number.MAX_SAFE_INTEGER)
    return null;

  return lastTimePlayed;
}

export function getDaysFromLastPlayed(self: Model, historyList: HistoryList): number {
  const episodeRepository = new Repository();
  let lastTimePlayed = self.lastTimePlayed ?? null;

  if (!lastTimePlayed) {
    lastTimePlayed = getLastTimePlayedFromHistory(self, historyList);

    if (lastTimePlayed) {
      const selfCopy: Model = {
        ...copyOf(self),
        lastTimePlayed,
      };
      const fullId = fullIdOf(selfCopy);

      episodeRepository.updateOneByIdAndGet(fullId, selfCopy);
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
