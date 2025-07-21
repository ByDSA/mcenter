import fs from "node:fs";
import { MediaElement } from "#modules/models";
import { render } from "./render-media-element";

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
      data += render(e);

    return data;
  }
}
