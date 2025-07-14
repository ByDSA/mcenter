import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DateTime } from "luxon";
import schedule from "node-schedule";
import { showError } from "$shared/utils/errors/showError";
import { dynamicLoadScriptFromEnvVar } from "../../DynamicLoad";

@Module( {} )
export class SchedulerModule implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    schedule.scheduleJob("* * * * * *", async (dateArg: Date) => {
      const date = DateTime.fromJSDate(dateArg);
      const { second } = date;

      if (second !== 0)
        return;

      const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE");
      const calendar = calendarFunc();
      const scheduleFunc = await dynamicLoadScriptFromEnvVar("SCHEDULE_FILE");

      scheduleFunc(date, calendar);
    } );

    console.log("Scheduler initialized!");
  }

  onModuleDestroy() {
    schedule.gracefulShutdown()
      .then(()=> {
        console.log("Scheduler stopped!");
      } )
      .catch(showError);
  }
}
