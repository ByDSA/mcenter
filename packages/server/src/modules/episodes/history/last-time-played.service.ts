import type { EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { DateTime } from "luxon";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EpisodesRepository } from "#episodes/crud/repository";
import { showError } from "#core/logging/show-error";
import { EpisodeHistoryRepository } from "./crud/repository";

@Injectable()
export class LastTimePlayedService {
  constructor(
    @Inject(forwardRef(() => EpisodesRepository))
    private readonly episodesRepo: EpisodesRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
  ) {
  }

  async updateEpisodeLastTimePlayedByEpisodeId(
    episodeId: EpisodeEntity["id"],
  ): Promise<number | null> {
    const lastTimePlayed = await this.historyRepo
      .calcEpisodeLastTimePlayedByEpisodeId(episodeId) ?? undefined;

    this.episodesRepo.patchOneByIdAndGet(episodeId, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  async updateEpisodeLastTimePlayedByCompKey(
    episodeCompKey: EpisodeCompKey,
  ): Promise<number | null> {
    const lastTimePlayed = await this.historyRepo
      .calcEpisodeLastTimePlayedByCompKey(episodeCompKey) ?? undefined;

    this.episodesRepo.patchOneByCompKeyAndGet(episodeCompKey, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  async getDaysFromLastPlayed(episode: EpisodeEntity): Promise<number> {
    let lastTimePlayed = episode.lastTimePlayed ?? null;

    if (!lastTimePlayed) {
      lastTimePlayed = await this.historyRepo
        .calcEpisodeLastTimePlayedByEpisodeId(episode.id);

      if (lastTimePlayed) {
        await this.episodesRepo.patchOneByIdAndGet(episode.id, {
          entity: {
            lastTimePlayed,
          },
        } );
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
