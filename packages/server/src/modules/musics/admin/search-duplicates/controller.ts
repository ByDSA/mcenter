import { Controller, Get } from "@nestjs/common";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { MusicsRepository } from "../../crud/repositories/music";
import { MusicDuplicatesIgnoreGroupsOdm } from "./repository/odm";
import { SearchDuplicatesService } from "./service";

@IsAdmin()
@Controller("/search-duplicates")
export class SearchDuplicatesController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly service: SearchDuplicatesService,
  ) { }

  @Get()
  async search() {
    const all = await this.musicRepo.getAll();
    const ignoreGroupsDocOdms = await MusicDuplicatesIgnoreGroupsOdm.Model.find();
    const ignoreGroups = MusicDuplicatesIgnoreGroupsOdm.toModels(ignoreGroupsDocOdms);
    const options = {
      ignoreGroups,
    };

    return {
      slugs: this.service.getSlugDups(all, options),
      titleArtist: this.service.getTitleArtistDups(all, options),
    };
  }
}
