import type { EpisodeEntity, EpisodeUserInfoEntity } from "#episodes/models";
import { DateTime } from "luxon";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { showError } from "#core/logging/show-error";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { EpisodeHistoryRepository } from "./crud/repository";

@Injectable()
export class LastTimePlayedService {
  constructor(
    @Inject(forwardRef(() => EpisodesRepository))
    private readonly episodesRepo: EpisodesRepository,
    private readonly episodesUsersRepo: EpisodesUsersRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
  ) {
  }

  async updateEpisodeLastTimePlayedByEpisodeId(
    userId: string,
    episodeId: EpisodeEntity["id"],
  ): Promise<number | null> {
    const lastTimePlayed = await this.historyRepo
      .calcEpisodeLastTimePlayedByEpisodeId(episodeId) ?? undefined;

    this.episodesUsersRepo.patchOneByIdAndGet( {
      userId,
      episodeId,
    }, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  async updateEpisodeLastTimePlayedById(
    userId: string,
    episodeId: EpisodeEntity["id"],
  ): Promise<number | null> {
    const lastTimePlayed = await this.historyRepo
      .calcEpisodeLastTimePlayedById(episodeId) ?? undefined;

    this.episodesUsersRepo.patchOneByIdAndGet( {
      userId,
      episodeId,
    }, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed ?? null;
  }

  async getDaysFromLastPlayed(userInfo: EpisodeUserInfoEntity): Promise<number> {
    let { lastTimePlayed } = userInfo;

    if (!lastTimePlayed) {
      lastTimePlayed = await this.historyRepo
        .calcEpisodeLastTimePlayedByEpisodeId(userInfo.episodeId) ?? 0;

      if (lastTimePlayed !== 0) {
        await this.episodesUsersRepo.patchOneByIdAndGet( {
          episodeId: userInfo.episodeId,
          userId: userInfo.userId,
        }, {
          entity: {
            lastTimePlayed,
          },
        } );
      }
    }

    if (lastTimePlayed !== 0) {
      const now = DateTime.now();
      const lastTimePlayedDate = DateTime.fromSeconds(lastTimePlayed);
      const { days } = now.diff(lastTimePlayedDate, "days");

      return days;
    }

    return Number.MAX_SAFE_INTEGER;
  }
}
