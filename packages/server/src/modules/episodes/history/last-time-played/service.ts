import type { EpisodeEntity, EpisodeUserInfoEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { assertIsDefined } from "$shared/utils/validation";
import { showError } from "#core/logging/show-error";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { EpisodeHistoryRepository } from "../crud/repository";
import { EpisodeHistoryEntryEvents } from "../crud/repository/events";

type Options = {
  requestingUserId: string;
};

@Injectable()
export class EpisodeLastTimePlayedService {
  constructor(
    private readonly episodesUsersRepo: EpisodesUsersRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
  ) { }

  @OnEvent(EpisodeHistoryEntryEvents.Created.TYPE)
  async handleCreateEntry(ev: EpisodeHistoryEntryEvents.Created.Event) {
    const { entity } = ev.payload;

    assertIsDefined(entity);
    // No se puede con actualizar con entity.date, porque se permiten crear entradas antiguas
    await this.updateEpisodeLastTimePlayedById(entity.resourceId, {
      requestingUserId: ev.payload.entity.userId,
    } )
      .catch(showError);
  }

  @OnEvent(EpisodeHistoryEntryEvents.Deleted.TYPE)
  async handleDeleteEntry(ev: EpisodeHistoryEntryEvents.Deleted.Event) {
    const { entity } = ev.payload;

    assertIsDefined(entity);
    await this.updateEpisodeLastTimePlayedById(entity.resourceId, {
      requestingUserId: ev.payload.entity.userId,
    } )
      .catch(showError);
  }

  async updateEpisodeLastTimePlayedByEpisodeId(
    episodeId: EpisodeEntity["id"],
    options: Options,
  ): Promise<Date | null> {
    const lastTimePlayed = await this.calcEpisodeLastTimePlayedByEpisodeId(
      episodeId,
      options,
    );

    this.episodesUsersRepo.patchOneByIdAndGet( {
      userId: options.requestingUserId,
      episodeId,
    }, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed;
  }

  async updateEpisodeLastTimePlayedById(
    episodeId: EpisodeEntity["id"],
    options: Options,
  ): Promise<Date | null> {
    const lastTimePlayed = await this.calcEpisodeLastTimePlayedByEpisodeId(
      episodeId,
      options,
    );

    this.episodesUsersRepo.patchOneByIdAndGet( {
      userId: options.requestingUserId,
      episodeId,
    }, {
      entity: {
        lastTimePlayed,
      },
    } ).catch(showError);

    return lastTimePlayed;
  }

  async getDaysFromLastPlayed(userInfo: EpisodeUserInfoEntity): Promise<number> {
    let { lastTimePlayed } = userInfo;

    if (!lastTimePlayed) {
      lastTimePlayed = await this.calcEpisodeLastTimePlayedByEpisodeId(userInfo.episodeId, {
        requestingUserId: userInfo.userId,
      } );

      if (lastTimePlayed !== null) {
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

    if (lastTimePlayed !== null) {
      const days = diffDays(lastTimePlayed, new Date());

      return days;
    }

    return Number.MAX_SAFE_INTEGER;
  }

  async calcEpisodeLastTimePlayedByEpisodeId(
    episodeId: string,
    options: Options,
  ): Promise<Date | null> {
    const last = await this.historyRepo.findLastByEpisodeId(episodeId, options);

    return last?.date ?? null;
  }
}

function diffDays(start: Date, end: Date): number {
  // 1. Forzamos ambas fechas a UTC a las 00:00:00.
  // Esto elimina cualquier distorsión por zona horaria o cambio de hora local.
  const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const unDia = 1000 * 60 * 60 * 24;

  // 2. Ahora la división siempre será exacta porque en UTC los días siempre tienen 24h.
  return Math.floor((utc2 - utc1) / unDia);
}
