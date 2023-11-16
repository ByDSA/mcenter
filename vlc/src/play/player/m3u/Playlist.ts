import fs from "fs";
import { MediaElement, render } from "./MediaElement";

export default class Playlist {
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