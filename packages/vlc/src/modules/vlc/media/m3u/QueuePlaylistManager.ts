/* eslint-disable accessor-pairs */
import fs from "fs";
import path from "path";
import { MediaElement } from "#modules/models";
import { Playlist } from "./Playlist";

export class QueuePlaylistManager {
  #currentNumber: number;

  #folder: string;

  constructor(folder: string) {
    this.#folder = folder;
    let i;

    // eslint-disable-next-line no-constant-condition
    for (i = 0; true; i++) {
      const file = this.getFullPathByNum(i);

      if (!fs.existsSync(file))
        break;
    }

    this.#currentNumber = i;
  }

  get nextNumber(): number {
    return this.#currentNumber;
  }

  get firstFile(): string {
    return this.getFullPathByNum(0);
  }

  add(...elements: MediaElement[]) {
    const playlist = new Playlist();

    for (const e of elements)
      playlist.addElement(e);

    const nextElement: MediaElement = {
      path: generateName(this.#currentNumber + 1),
    };

    playlist.addElement(nextElement);
    const fullpath = this.getFullPathByNum(this.#currentNumber);

    playlist.saveTo(fullpath);

    this.#currentNumber++;
  }

  clear() {
    let i = 0;

    while (true) {
      const p = this.getFullPathByNum(i);

      if (!fs.existsSync(p))
        break;

      fs.unlinkSync(p);
      i++;
    }

    this.#currentNumber = 0;
    console.log("Queue cleared!");
  }

  private getFullPathByNum(num: number): string {
    return path.join(this.#folder, generateName(num));
  }
}

function generateName(num: number): string {
  return `next_${num}.m3u8`;
}
