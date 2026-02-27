import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks";
import { UpdateYtDlpTaskHandler } from "./task.handler";

@Module( {
  imports: [TasksModule],
  providers: [
    UpdateYtDlpTaskHandler,
  ],
  exports: [UpdateYtDlpTaskHandler],
} )
export class UpdateYtDlpModule {}
