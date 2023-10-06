import * as schedule from "node-schedule";
import job from "./job";

schedule.scheduleJob("/30 * * * *", async () =>{
  await job();
} );

job();