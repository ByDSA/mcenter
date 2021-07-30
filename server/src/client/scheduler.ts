import dotenv from "dotenv";
import { DateTime } from "luxon";
import schedule from "node-schedule";
import { dynamicLoadScriptFromEnvVar } from "../actions/utils/DynamicLoad";

dotenv.config();

schedule.scheduleJob("* * * * * *", async (dateArg: Date) => {
  const date = DateTime.fromJSDate(dateArg);
  const { second } = date;

  if (second !== 0)
    return;

  const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE"); // TODO: a db: user/calendar
  const calendar = calendarFunc();
  const scheduleFunc = await dynamicLoadScriptFromEnvVar("SCHEDULE_FILE"); // TODO a db: user/scheduler

  scheduleFunc(date, calendar);
} );
