import { History } from "#modules/history";
import { DateType } from "#modules/utils/time/date-type";
import { DateTime } from "luxon";
import { SerieId } from "../serie";
import { Episode, EpisodeRepository } from "./model";
import { copyOfEpisode } from "./model/episode.entity";

function getTimestampFromDate(date: DateType): number {
  if (date.timestamp)
    return date.timestamp;

  const d = new Date(date.year, date.month - 1, date.day);

  return d.getTime() / 1000;
}

export function getLastTimePlayedFromHistory(self: Episode, history: History[]): number | null {
  let lastTimePlayed = Number.MAX_SAFE_INTEGER;

  for (const h of history) {
    if (self && h.episodeId === self.id) {
      const currentTimestamp = getTimestampFromDate(h.date);

      if (currentTimestamp < lastTimePlayed)
        lastTimePlayed = currentTimestamp;
    }
  }

  if (lastTimePlayed === Number.MAX_SAFE_INTEGER)
    return null;

  return lastTimePlayed;
}

export function getDaysFromLastPlayed(self: Episode, serieId: SerieId, history: History[]): number {
  let lastTimePlayed = self.lastTimePlayed ?? null;

  if (!lastTimePlayed) {
    lastTimePlayed = getLastTimePlayedFromHistory(self, history);

    if (lastTimePlayed) {
      const selfCopy = {
        ...copyOfEpisode(self),
        lastTimePlayed,
      };

      EpisodeRepository.getInstance<EpisodeRepository>().updateOne( {
        episode:selfCopy,
        serieId,
      } );
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
