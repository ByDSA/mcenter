import fs from "fs";
import { MediaElement, render } from "./MediaElement";

export class Playlist {
    private _elements: MediaElement[] = [];

    addElement(element: MediaElement): Playlist {
        this._elements.push(element);
        return this;
    }

    saveTo(path: string): boolean {
        fs.writeFileSync(path, this.toString());

        return true;
    }

    toString(): string {
        let data = "";
        for (const e of this._elements)
            data += render(e);
        return data;
    }
}