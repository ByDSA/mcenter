import fs from "fs";
import { MediaElement } from "./MediaElement";
import { Playlist } from "./Playlist";

export class QueuePlaylistManager {
    private currentNumber: number;

    constructor(private folder: string) {
        let i;
        for (i = 0; true; i++) {
            const file = this.getFullPathByNum(i);
            if (!fs.existsSync(file))
                break;
        }
        this.currentNumber = i;
    }

    get nextNumber(): number {
        return this.currentNumber;
    }

    get firstFile(): string {
        return this.getFullPathByNum(0);
    }

    add(...elements: MediaElement[]) {
        const playlist = new Playlist();
        for (const e of elements)
            playlist.addElement(e);
        const nextElement: MediaElement = {
            path: generateName(this.currentNumber + 1)
        };
        playlist.addElement(nextElement);
        const fullpath = this.getFullPathByNum(this.currentNumber);
        playlist.saveTo(fullpath);

        this.currentNumber++;
    }

    clear() {
        let i = 0;
        while (true) {
            let path = this.getFullPathByNum(i);
            if (!fs.existsSync(path))
                break;
            fs.unlinkSync(path);
            i++;
        }

        this.currentNumber = 0;
    }

    private getFullPathByNum(num: number): string {
        return this.folder + "/" + generateName(num);
    }
}

function generateName(num: number): string {
    return `next_${num}.m3u8`;
}