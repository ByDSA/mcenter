/* eslint-disable import/no-cycle */
import type { EpisodeCompKey, EpisodeEntity, EpisodeId } from "#episodes/models";
import { DateTime } from "luxon";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { deepCopy } from "$shared/utils/objects";
import { showError } from "$shared/utils/errors/showError";
import { EpisodesRepository } from "#episodes/repositories/repository";
import { EpisodeHistoryEntriesRepository } from "./repositories/repository";

@Injectable()
export class LastTimePlayedService {
  constructor(
    @Inject(forwardRef(() => EpisodesRepository))
    private readonly episodesRepository: EpisodesRepository,
    private readonly entriesRepository: EpisodeHistoryEntriesRepository,
  ) {
  }

  async updateEpisodeLastTimePlayedByEpisodeId(
    episodeId: EpisodeId,
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
        const selfCopy: EpisodeEntity = {
          ...deepCopy(episode),
          lastTimePlayed,
        };
        const { id } = selfCopy;

        await this.episodesRepository.updateOneByIdAndGet(id, selfCopy);
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
