import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks";
import { ImageCoversCrudModule } from "../module";
import { ImageCoversRebuildAllController } from "./task-rebuild/controller";
import { ImageCoversRebuildAllTaskHandler } from "./task-rebuild/task.handler";

@Module( {
  imports: [
    ImageCoversCrudModule,
    TasksModule,
  ],
  controllers: [
    ImageCoversRebuildAllController,
  ],
  providers: [
    ImageCoversRebuildAllTaskHandler,
  ],
  exports: [],
} )
export class ImageCoversAdminModule {}
