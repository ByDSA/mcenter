import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { getUniqueString } from "#modules/resources/get-unique-string";
import { MusicsRepository } from "../repositories/music";

@Injectable()
export class MusicAvailableSlugGeneratorService {
  constructor(
    @Inject(forwardRef(()=>MusicsRepository))
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  async getAvailableSlugFromSlug(base: string): Promise<string> {
    return await getUniqueString(
      base,
      async (candidate) => {
        const music = await this.musicRepo.getOneBySlug(candidate);

        return !music;
      },
    );
  }
}
