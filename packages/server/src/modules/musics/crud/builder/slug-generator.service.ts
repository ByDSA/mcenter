import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ARTIST_EMPTY, Music } from "#musics/models";
import { MusicsRepository } from "../repository";
import { fixSlug } from "./fix-slug";

@Injectable()
export class MusicSlugGeneratorService {
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

  async generateAvailableSlugFrom(params: GenerateSlugParams) {
    const slug = generateSlug(params);
    const availableSlug = await this.getAvailableSlugFromSlug(slug);

    return availableSlug;
  }
}

type GenerateSlugParams = {
  title: string;
  artist: string;
};
function generateSlug( { title, artist }: GenerateSlugParams): string {
  const base = !artist || artist === ARTIST_EMPTY ? title : `${artist}-${title}`;
  const ret = fixSlug(base);

  if (ret === null)
    throw new Error("Invalid slug");

  return ret;
}
