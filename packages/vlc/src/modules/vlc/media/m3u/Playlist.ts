import fs from "node:fs";
import { genM3u8Item } from "$shared/models/resources";
import { MediaElement } from "#modules/models";

export class Playlist {
  #elements: MediaElement[] = [];

  addElement(element: MediaElement): Playlist {
    this.#elements.push(element);

    return this;
  }

  saveTo(path: string): boolean {
    fs.writeFileSync(path, this.toString());

    return true;
  }

  toString(): string {
    let data = "";

    for (const e of this.#elements)
      data += genM3u8Item(e);

    return data;
  }
}
