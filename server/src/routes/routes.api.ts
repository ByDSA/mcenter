import { Express, Request, Response } from "express";
import fs from "fs";
import { backup } from "../actions/backup/backupStuff";

export default function apiRoutes(app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World! ");
  } );

  app.get("/api/backup", async (req: Request, res: Response) => {
    await backup();
    res.send("Done!");
  } );

  app.get("/api/stop", (req: Request, res: Response) => {
    fs.writeFileSync(".stop", "");
    res.send("stop");
  } );

  app.get("/api/resume", (req: Request, res: Response) => {
    if (fs.existsSync(".stop")) {
      fs.unlinkSync(".stop");
      res.send("resume");
    } else
      res.send("Already resumed");
  } );
}
