import { Controller, Get } from "@nestjs/common";
import { MusicEntity } from "$shared/models/musics";
import { diff } from "just-diff";
import { MusicBuilderService } from "#musics/crud/builder/music-builder.service";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { MusicsRepository } from "../../crud/repositories/music";

type Result = {
  old: MusicEntity;
  new: MusicEntity;
  diff: unknown;
}[];

@IsAdmin()
@Controller("/fix-info")
export class MusicFixInfoController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly builderService: MusicBuilderService,
  ) {
  }

  @Get()
  async fix() {
    const all = await this.musicRepo.getAll(null);
    const changed = all.reduce((acc, music)=> {
      const fixed = this.builderService.fixFields(music);
      const d = diff(music, fixed);

      if (d.length > 0) {
        acc.push( {
          old: music,
          diff: d,
          new: fixed,
        } );
      }

      return acc;
    }, [] as Result);

    for (const c of changed) {
      c.new = await this.musicRepo.patchOneByIdAndGet(c.old.id, {
        entity: c.new,
      } );
    }

    return changed;
  }
}
