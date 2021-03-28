import dotenv from "dotenv";
import schedule from "node-schedule";
import { dynamicLoad } from "./DynamicLoad";
import { destructDate } from "./TimeUtils";
dotenv.config();

const job = schedule.scheduleJob('* * * * * *', async function (fireDate: Date) {
    const { seconds } = destructDate(fireDate);
    if (seconds !== 0)
        return;

    const { SCHEDULE_FILE } = process.env;
    if (!SCHEDULE_FILE)
        throw new Error("No SCHEDULE_FILE env found");

    await dynamicLoad({ file: SCHEDULE_FILE, sample: sampleScheduleJs, args: [fireDate] });
});

const sampleScheduleJs = `module.exports = function (fireDate) {
    console.log(\`Date: \${fireDate}\`)
}`;