import type { QueryDto } from "../play-stream/controller";
import { Injectable } from "@nestjs/common";
import { MusicEntity, MusicEntityWithFileInfos, musicEntityWithFileInfosSchema } from "$shared/models/musics";
import { musicToMediaElement } from "$shared/models/player";
import { mediaElementFixPlayerLabels } from "$shared/models/resources";
import { assertZod } from "$shared/utils/validation/zod";
import z from "zod";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { assertFoundClient, assertIsNotEmptyClient } from "#utils/validation/found";
import { RemotePlayersRepository } from "../player-services/repository";
import { PlayService } from "../play.service";

type ProcessAndPlayMusicsProps = {
  remotePlayerId: string;
  musics: MusicEntityWithFileInfos[];
  force?: boolean;
};
@Injectable()
export class PlayMusicService {
  constructor(
    private readonly historyRepo: MusicHistoryRepository,
    private readonly musicsRepo: MusicsRepository,
    private readonly playService: PlayService,
    private readonly remotePlayersRepo: RemotePlayersRepository,
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

    return this.processAndPlayMusics( {
      remotePlayerId,
      musics,
      force,
    } );
  }

  private async processAndPlayMusics(
    { musics, remotePlayerId, force }: ProcessAndPlayMusicsProps,
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

    const userIds = await this.remotePlayersRepo.getAllViewersOf(remotePlayerId);

    for (const userId of userIds) {
      const isLast = await this.historyRepo.isLast(musics[0].id, userId);
      const musicsToAddInHistory: MusicEntity[] = isLast
        ? musics.slice(1)
        : musics;

      for (const m of musicsToAddInHistory)
        await this.historyRepo.createNewEntryNowFor(m.id, userId);
    }

    return musics;
  }
}
