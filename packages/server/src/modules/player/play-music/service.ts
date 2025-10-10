import type { QueryDto } from "../play-stream/controller";
import { Injectable } from "@nestjs/common";
import { MusicEntity, MusicEntityWithFileInfos, musicEntityWithFileInfosSchema } from "$shared/models/musics";
import { musicToMediaElement } from "$shared/models/player";
import { mediaElementFixPlayerLabels } from "$shared/models/resources";
import { assertZod } from "$shared/utils/validation/zod";
import z from "zod";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { MusicsRepository } from "#musics/crud/repository";
import { assertFoundClient, assertIsNotEmptyClient } from "#utils/validation/found";
import { PlayService } from "../play.service";

@Injectable()
export class PlayMusicService {
  constructor(
    private readonly historyRepo: MusicHistoryRepository,
    private readonly musicsRepo: MusicsRepository,
    private readonly playService: PlayService,
  ) { }

  async playMusic(
    remotePlayerId: string,
    slug: string,
    query: QueryDto,
  ) {
    const { force } = query;
    const musics = [await this.musicsRepo
      .getOneBySlug(slug, {
        expand: ["fileInfos"],
      } )]
      .filter(Boolean) as MusicEntityWithFileInfos[];

    return this.processAndPlayMusics(remotePlayerId, musics, force);
  }

  private async processAndPlayMusics(
    remotePlayerId: string,
    musics: MusicEntityWithFileInfos[],
    force?: boolean,
  ): Promise<MusicEntityWithFileInfos[]> {
    assertFoundClient(musics[0]);
    assertZod(z.array(musicEntityWithFileInfosSchema), musics);

    const mediaElements = musics.map((m) => {
      const mediaElement = musicToMediaElement(m, {
        local: true,
      } );

      mediaElement.path = `music/data/${mediaElement.path}`;

      return mediaElementFixPlayerLabels(mediaElement);
    } );

    assertIsNotEmptyClient(mediaElements);
    await this.playService.play( {
      remotePlayerId,
      mediaElements,
      force,
    } );

    const isLast = await this.historyRepo.isLast(musics[0].id);
    const musicsToAddInHistory: MusicEntity[] = isLast
      ? musics.slice(1)
      : musics;

    for (const m of musicsToAddInHistory)
      await this.historyRepo.createNewEntryNowFor(m.id);

    return musics;
  }
}
