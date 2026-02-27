import { Module } from "@nestjs/common";
import { MeilisearchModule } from "#modules/search/module";
import { TasksModule } from "#core/tasks";
import { SyncMeilisearchIndexesTaskHandler } from "./task.handler";
import { IndexSyncService } from "./sync-all.service";

@Module( {
  imports: [MeilisearchModule, TasksModule],
  providers: [
    SyncMeilisearchIndexesTaskHandler, IndexSyncService,
  ],
  exports: [SyncMeilisearchIndexesTaskHandler, IndexSyncService],
} )
export class SyncMeilisearchIndexesModule {}
