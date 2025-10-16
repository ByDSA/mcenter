import { forwardRef, Inject, Injectable } from "@nestjs/common";
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
      music = await this.musicRepo.getOneBySlug(currentSlug);

      if (!music)
        return currentSlug;

      i++;
      currentSlug = `${base}-${i}`;
    }
  }
}
