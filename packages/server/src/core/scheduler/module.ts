import { execSync } from "node:child_process";
import { Logger, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DateTime } from "luxon";
import schedule from "node-schedule";
import { IndexSyncService } from "#modules/search/indexes/sync-all.service";
import { MeilisearchModule } from "#modules/search/module";
import { showError } from "#core/logging/show-error";
import { dynamicLoadScriptFromEnvVar } from "../../dynamic-load";

@Module( {
  imports: [MeilisearchModule],
} )
export class SchedulerModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerModule.name);

  constructor(
    private readonly indexSyncService: IndexSyncService,
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
      await this.syncAllMeiliseachIndexes();

      await this.updateYtDlp();
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

  // eslint-disable-next-line require-await
  private async updateYtDlp() {
    this.logger.log("Updating yt-dlp ...");

    execSync("sudo yt-dlp -U");
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
