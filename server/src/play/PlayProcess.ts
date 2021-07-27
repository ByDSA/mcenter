import { VideoInterface } from "../db/models/video";
import { MediaElement } from "../m3u/MediaElement";
import { QueuePlaylistManager } from "../m3u/QueuePlaylistManager";
import { isRunning } from "../Utils";
import { closeVLC, openVLC } from "./vlc";

export default class PlayProcess {
  private queue: QueuePlaylistManager;

  constructor(private episodes: VideoInterface[], private openNewInstance: boolean) {
    this.queue = new QueuePlaylistManager(TMP_PATH || "/");
  }

  async closeIfNeeded() {
    if (this.openNewInstance || await isRunning("vlc") && this.queue.nextNumber === 0)
      await closeVLC();
  }

  async openIfNeeded() {
    if (!await isRunning("vlc")) {
      this.openNewInstance = true;

      if (this.queue.nextNumber > 0)
        this.queue.clear();
    }
  }

  async do() {
    console.log(`Play function: ${this.episodes[0].id}`);

    await this.closeIfNeeded();

    await this.openIfNeeded();

    const elements: MediaElement[] = this.episodes.map(episodeToMediaElement);

    this.queue.add(...elements);

    if (this.openNewInstance) {
      const file = this.queue.firstFile;
      const process = await openVLC(file);

      process.on("exit", (code: number) => {
        if (code === 0)
          this.queue.clear();

        console.log("Closed VLC");
      } );
    }
  }
}
