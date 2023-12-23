import { Music } from "#shared/models/musics";
// eslint-disable-next-line import/no-cycle
import MusicRepository from "./Repository";

type Params = {
  musicRepository: MusicRepository;
};
export default class UrlGenerator {
  #musicRepository: MusicRepository;

  constructor( {musicRepository}: Params) {
    this.#musicRepository = musicRepository;
  }

  async getAvailableUrlFromUrl(base: string): Promise<string> {
    let currentUrl = base;
    let music: Music | null;
    let i = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      music = await this.#musicRepository.findByUrl(currentUrl);

      if (!music)
        return currentUrl;

      i++;
      currentUrl = `${base}-${i}`;
    }
  }

  // eslint-disable-next-line no-use-before-define
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
function generateUrl( {title, artist}: GenerateUrlParams): string {
  const base = !artist ? title : `${artist}-${title}`;

  return fixUrl(base);
}

export function fixUrl(url: string): string {
  const fixed = url
    .toLowerCase()
    .replaceAll(/&|\[|\]|:/g, "")
    .replaceAll(/,|\./g,"")
    .replaceAll(/!|¡|\?|¿/g,"")
    .replaceAll(/\(/g,"")
    .replaceAll(/\)/g,"")
    .replaceAll(/"|'/g,"")
    .replaceAll(/”|’/g,"")
    .replaceAll(/(official-)?lyric-video/g,"")
    .replaceAll(/-$/g,"")
    .replaceAll(/ñ/g,"n")
    .replaceAll(/ç/g,"c")
    .replaceAll(/á|à|ä/g,"a")
    .replaceAll(/é|è|ë/g,"e")
    .replaceAll(/í|ì|ï/g,"i")
    .replaceAll(/ó|ò|ö/g,"o")
    .replaceAll(/ú|ù|ü/g,"u")
    .replaceAll(/_/g,"-")
    .replaceAll(/\//g,"-")
    .replaceAll(/ /g, "-")
    .replaceAll(/--/g,"-");

  return fixed;
}