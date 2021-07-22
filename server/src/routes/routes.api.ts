import { Express, Request, Response } from "express";
import { backup } from "../backup/backupStuff";

export default function apiRoutes(app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World! ");
  } );

  app.get("/api/backup", async (req: Request, res: Response) => {
    await backup();
    res.send("Done!");
  } );
}
