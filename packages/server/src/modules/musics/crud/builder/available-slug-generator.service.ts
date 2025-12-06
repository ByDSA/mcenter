import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { slugSchema } from "$shared/models/utils/schemas/slug";
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
    let currentSlug = base;
    let music: Music | null;
    let i = 1;

    while (true) {
      music = await this.musicRepo.getOneBySlug(null, currentSlug);

      if (!music)
        return slugSchema.parse(currentSlug);

      i++;
      currentSlug = `${base}-${i}`;
    }
  }
}
