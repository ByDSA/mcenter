import { ARTIST_EMPTY, Music } from "#shared/models/musics";
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
  const base = !artist || artist === ARTIST_EMPTY ? title : `${artist}-${title}`;

  return fixUrl(base);
}

export function fixUrl(url: string): string {
  let fixed = url
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
    .replaceAll(/\$/, "s")
    .replaceAll(/á|à|ä|â/g,"a")
    .replaceAll(/é|è|ë|ê/g,"e")
    .replaceAll(/í|ì|ï|î/g,"i")
    .replaceAll(/ó|ò|ö|ô/g,"o")
    .replaceAll(/ú|ù|ü|û/g,"u")
    .replaceAll(/_/g,"-")
    .replaceAll(/\//g,"-")
    .replaceAll(/ /g, "-");

  fixed = removeForeignCharacters(fixed);

  if (fixed.length === 0)
    return "empty";

  fixed = fixed.replaceAll(/--/g,"-");

  return fixed;
}

function isValidCharacter(c: string): boolean {
  return /^[a-z0-9-]+$/.test(c);
}

function removeForeignCharacters(str: string): string {
  let ret = "";

  for (const c of str) {
    if (isValidCharacter(c))
      ret += c;
  }

  return ret;
}