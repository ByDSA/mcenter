import { Injectable } from "@nestjs/common";
import { MusicsIndexService } from "../../indexes/musics.service";

@Injectable()
export class IndexSyncService {
  constructor(
    private readonly musics: MusicsIndexService,
  ) {

  }

  async syncAll() {
    return {
      musics: await this.musics.syncAll(),
    };
  }
}
