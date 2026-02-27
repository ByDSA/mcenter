import { Logger, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DateTime } from "luxon";
import schedule from "node-schedule";
import { IndexSyncService } from "#modules/search/admin/sync-indexes/sync-all.service";
import { showError } from "#core/logging/show-error";
import { TasksModule } from "#core/tasks";
import { UpdateYtDlpTaskHandler } from "#modules/youtube/admin/update-yt-dlp/task.handler";
import { SyncMeilisearchIndexesTaskHandler } from "#modules/search/admin/sync-indexes/task.handler";
import { SyncMeilisearchIndexesModule } from "#modules/search/admin/sync-indexes/module";
import { UpdateYtDlpModule } from "#modules/youtube/admin/update-yt-dlp/module";
import { dynamicLoadScriptFromEnvVar } from "../../dynamic-load";

@Module( {
  imports: [TasksModule, SyncMeilisearchIndexesModule, UpdateYtDlpModule],
  providers: [],
} )
export class SchedulerModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerModule.name);

  constructor(
    private readonly indexSyncService: IndexSyncService,
    private readonly updateYtDlpHandler: UpdateYtDlpTaskHandler,
    private readonly syncMeilisearchIndexesHandler: SyncMeilisearchIndexesTaskHandler,
  ) { }

  onModuleInit() {
    schedule.scheduleJob("* * * * * *", async (dateArg: Date) => {
      const seconds = dateArg.getSeconds();

      if (seconds !== 0)
        return;

      const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE");
      const calendar = calendarFunc();
      const scheduleFunc = await dynamicLoadScriptFromEnvVar("SCHEDULE_FILE");

      this.logger.log("Checking schedule...");
      const date = DateTime.fromJSDate(dateArg);

      scheduleFunc(date, calendar);
    } );

    // 5 AM
    schedule.scheduleJob("0 5 * * *", async () => {
      await this.syncMeilisearchIndexesHandler.addTask(undefined);

      await this.updateYtDlpHandler.addTask(undefined);
    } );

    this.onInit()
      .catch(showError);

    this.logger.log("Scheduler initialized!");
  }

  private async onInit() {
    await this.syncAllMeiliseachIndexes();

    // No se pone updateYtDlp, porque hay rate limit
  }

  private async syncAllMeiliseachIndexes() {
    this.logger.log("Sync Meilisearch data ...");

    await this.indexSyncService.syncAll();
  }

  onModuleDestroy() {
    schedule.gracefulShutdown()
      .then(()=> {
        this.logger.warn("Scheduler stopped!");
      } )
      .catch(e=> {
        this.logger.error(e);
      } );
  }
}
