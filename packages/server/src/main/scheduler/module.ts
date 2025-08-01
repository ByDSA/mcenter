import { Logger, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DateTime } from "luxon";
import schedule from "node-schedule";
import { dynamicLoadScriptFromEnvVar } from "../../DynamicLoad";

@Module( {} )
export class SchedulerModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerModule.name);

  onModuleInit() {
    schedule.scheduleJob("* * * * * *", async (dateArg: Date) => {
      const date = DateTime.fromJSDate(dateArg);
      const { second } = date;

      if (second !== 0)
        return;

      const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE");
      const calendar = calendarFunc();
      const scheduleFunc = await dynamicLoadScriptFromEnvVar("SCHEDULE_FILE");

      this.logger.log("Checking schedule...");
      scheduleFunc(date, calendar);
    } );

    this.logger.log("Scheduler initialized!");
  }

  onModuleDestroy() {
    schedule.gracefulShutdown()
      .then(()=> {
        this.logger.log("Scheduler stopped!");
      } )
      .catch(e=> {
        this.logger.error(e);
      } );
  }
}
