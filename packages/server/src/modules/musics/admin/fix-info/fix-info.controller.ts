import { Controller, Get } from "@nestjs/common";
import { MusicsRepository } from "../../crud/repository";
import { MusicEntity } from "$shared/models/musics";
import { MusicBuilderService } from "#modules/musics/crud/builder/music-builder.service";
import { diff } from "just-diff";
type Result = {
  old: MusicEntity;
  diff: unknown;
}[]

@Controller("/fix-info")
export class MusicFixInfoController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private builderService: MusicBuilderService,
  ) {
  }

  @Get()
  async fix() {
    const all = await this.musicRepo.getAll();

    const changed = all.reduce((acc, music)=> {
      const fixed = this.builderService.fixFields(music);

      const d = diff(music, fixed);

      if (d.length > 0)
        acc.push({old: music, diff: d});


      return acc;
    }, [] as Result)


    return changed;
  }
}
