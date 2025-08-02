import type { EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { DateTime } from "luxon";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EpisodesRepository } from "#episodes/rest/repository";
import { showError } from "#main/logging/show-error";
import { EpisodeHistoryEntriesRepository } from "./rest/repository";

@Injectable()
export class LastTimePlayedService {
  constructor(
    @Inject(forwardRef(() => EpisodesRepository))
    private readonly episodesRepository: EpisodesRepository,
    private readonly entriesRepository: EpisodeHistoryEntriesRepository,
  ) {
  }

  async updateEpisodeLastTimePlayedByEpisodeId(
    episodeId: EpisodeEntity["id"],
  ): Promise<number | null> {
    const lastTimePlayed = await this.entriesRepository
      .calcEpisodeLastTimePlayedByEpisodeId(episodeId) ?? undefined;

    this.episodesRepository.patchOneByIdAndGet(episodeId, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  async updateEpisodeLastTimePlayedByCompKey(
    episodeCompKey: EpisodeCompKey,
  ): Promise<number | null> {
    const lastTimePlayed = await this.entriesRepository
      .calcEpisodeLastTimePlayedByCompKey(episodeCompKey) ?? undefined;

    this.episodesRepository.patchOneByCompKeyAndGet(episodeCompKey, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  async getDaysFromLastPlayed(episode: EpisodeEntity): Promise<number> {
    let lastTimePlayed = episode.lastTimePlayed ?? null;

    if (!lastTimePlayed) {
      lastTimePlayed = await this.entriesRepository
        .calcEpisodeLastTimePlayedByEpisodeId(episode.id);

      if (lastTimePlayed) {
        await this.episodesRepository.patchOneByIdAndGet(episode.id, {
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
