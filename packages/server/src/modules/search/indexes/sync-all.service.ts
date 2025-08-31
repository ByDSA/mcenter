import { Injectable } from "@nestjs/common";
import { MusicsIndexService } from "./musics.service";

@Injectable()
export class IndexSyncService {
  constructor(
    private readonly musics: MusicsIndexService,
  ) {

  }

  async syncAll() {
    await this.musics.syncAll();
  }
}
