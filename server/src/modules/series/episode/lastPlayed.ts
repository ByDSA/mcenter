import HistoryList from "#modules/history/model/HistoryList";
import { DateType } from "#modules/utils/time/date-type";
import { DateTime } from "luxon";
import { SerieId, SerieRepository } from "../serie";
import { EpisodeRepository } from "./model";
import { Episode, compareEpisodeId, copyOfEpisode } from "./model/Episode";

function getTimestampFromDate(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

export function getLastTimePlayedFromHistory(self: Episode, historyList: HistoryList): number | null {
  let lastTimePlayed = Number.MAX_SAFE_INTEGER;

  for (const historyEntry of historyList.entries) {
    if (self && compareEpisodeId(historyEntry.episodeId, self.id)) {
      const currentTimestamp = getTimestampFromDate(historyEntry.date);

      if (currentTimestamp < lastTimePlayed)
        lastTimePlayed = currentTimestamp;
    }
  }

  if (lastTimePlayed === Number.MAX_SAFE_INTEGER)
    return null;

  return lastTimePlayed;
}

export function getDaysFromLastPlayed(self: Episode, serieId: SerieId, historyList: HistoryList): number {
  const serieRepository = new SerieRepository();
  const episodeRepository = new EpisodeRepository( {
    serieRepository,
  } );
  let lastTimePlayed = self.lastTimePlayed ?? null;

  if (!lastTimePlayed) {
    lastTimePlayed = getLastTimePlayedFromHistory(self, historyList);

    if (lastTimePlayed) {
      const selfCopy: Episode = {
        ...copyOfEpisode(self),
        lastTimePlayed,
      };

      episodeRepository.updateOneAndGet(selfCopy);
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
