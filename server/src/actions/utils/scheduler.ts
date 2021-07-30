import dotenv from "dotenv";
import { DateTime } from "luxon";
import schedule from "node-schedule";
import { dynamicLoadScriptFromEnvVar } from "./DynamicLoad";

dotenv.config();

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
