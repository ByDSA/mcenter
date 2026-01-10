import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { slugSchema, SLUG_MAX_LENGTH } from "$shared/models/utils/schemas/slug";
import { Music } from "#musics/models";
import { MusicsRepository } from "../repositories/music";

@Injectable()
export class MusicAvailableSlugGeneratorService {
  constructor(
    @Inject(forwardRef(()=>MusicsRepository))
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  async getAvailableSlugFromSlug(base: string): Promise<string> {
    let currentSlug = slugSchema.parse(base.substring(0, SLUG_MAX_LENGTH));
    let music: Music | null;
    let i = 1;

    while (true) {
      music = await this.musicRepo.getOneBySlug(currentSlug);

      if (!music)
        return slugSchema.parse(currentSlug);

      i++;
      const append = `-${i}`;

      currentSlug = `${base.substring(0, SLUG_MAX_LENGTH - append.length)}${append}`;
    }
  }
}
