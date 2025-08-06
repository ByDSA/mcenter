// src/music/raw-handler.service.ts
import { Injectable, StreamableFile } from "@nestjs/common";
import { Request, Response } from "express";
import { assertFound } from "#utils/validation/found";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsRepository } from "../crud/repository";
import { MusicEntity } from "../models";
import { getAbsolutePath } from "../utils";
import { MusicFileInfoEntity } from "../file-info/models";

type Slug = string;
@Injectable()
export class MusicSlugHandlerService {
  constructor(
    private readonly repo: MusicsRepository,
    private readonly historyRepo: MusicHistoryRepository,
    private readonly resourceSlugService: ResourceSlugService,
  ) {}

  async handle(
    slug: Slug,
    req: Request,
    res: Response,
  ): Promise<StreamableFile | void> {
    const music = await this.repo.getOneBySlug(slug, {
      expand: ["fileInfos"],
    } );

    assertFound(music);

    await this.updateHistory(music.id);

    return this.resourceSlugService.handle( {
      entity: music,
      req,
      res,
      getAbsolutePath,
      generateFilename: (entity: MusicEntity, fileInfo: MusicFileInfoEntity) => {
        const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));

        return `${entity.artist} - ${entity.title}${ext}`;
      },
    } );
  }

  private async updateHistory(musicId: string) {
    const isLast = await this.historyRepo.isLast(musicId);

    if (!isLast)
      await this.historyRepo.createNewEntryNowFor(musicId);
  }
}
