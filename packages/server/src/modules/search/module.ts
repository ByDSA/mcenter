import { Module } from "@nestjs/common";
import { MeiliSearch } from "meilisearch";
import { MeilisearchService } from "./meilisearch.service";
import { MusicsIndexService } from "./indexes/musics.service";
import { MusicsSearchService } from "./search-services/musics.search.service";
import { IndexSyncService } from "./indexes/sync-all.service";

@Module( {
  providers: [
    MeilisearchService,
    MusicsIndexService,
    MusicsSearchService,
    IndexSyncService,
    {
      provide: MeiliSearch,
      useFactory: (): MeiliSearch => {
        return new MeiliSearch( {
          host: process.env.MEILI_URL ?? "http://localhost:7700",
          apiKey: process.env.MEILI_MASTER_KEY,
        } );
      },
    },
  ],
  exports: [MeilisearchService, MusicsSearchService, IndexSyncService],
} )
export class MeilisearchModule {}
