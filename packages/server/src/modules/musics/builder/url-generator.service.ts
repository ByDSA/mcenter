import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ARTIST_EMPTY, Music } from "#musics/models";
import { MusicRepository } from "../rest/repository";
import { fixUrl } from "./fix-url";

@Injectable()
export class MusicUrlGeneratorService {
  constructor(
    @Inject(forwardRef(()=>MusicRepository))
    private readonly musicRepo: MusicRepository,
  ) {
  }

  async getAvailableUrlFromUrl(base: string): Promise<string> {
    let currentUrl = base;
    let music: Music | null;
    let i = 1;

    while (true) {
      music = await this.musicRepo.getOneByUrl(currentUrl);

      if (!music)
        return currentUrl;

      i++;
      currentUrl = `${base}-${i}`;
    }
  }

  async generateAvailableUrlFrom(params: GenerateUrlParams) {
    const url = generateUrl(params);
    const availableUrl = await this.getAvailableUrlFromUrl(url);

    return availableUrl;
  }
}

type GenerateUrlParams = {
  title: string;
  artist: string;
};
function generateUrl( { title, artist }: GenerateUrlParams): string {
  const base = !artist || artist === ARTIST_EMPTY ? title : `${artist}-${title}`;
  const ret = fixUrl(base);

  if (ret === null)
    throw new Error("Invalid url");

  return ret;
}
