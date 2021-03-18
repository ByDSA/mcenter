import fs from "fs";
import schedule from "node-schedule";
import { destructDate } from "./TimeUtils";

const job = schedule.scheduleJob('* * * * * *', async function (fireDate: Date) {
    const { seconds } = destructDate(fireDate);
    if (seconds !== 0)
        return;

    const filename = ".schedule.js";
    const path = `../${filename}`;
    try {
        const { default: s } = await import(path);
        s(fireDate);
        delete require.cache[require.resolve(path)];
    } catch (e) {
        console.log(`File not found: ${path}`);
        fs.writeFile(filename, sampleScheduleJs, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
});

const sampleScheduleJs = `module.exports = function (fireDate) {
    console.log(\`Date: \${fireDate}\`)
}`;