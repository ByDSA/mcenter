import { Server } from "node:http";
import { Express } from "express";

export interface App {
  init(app: Express): Promise<void>;
  listen(server: Server): Promise<void>;
  close(): Promise<void>;
  getExpressApp(): Express | null;
}
