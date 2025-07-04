import { Server } from "node:http";
import { Express } from "express";

export interface App {
  init(): Promise<void>;
  listen(server: Server): Promise<void>;
  close(): Promise<void>;
  getExpressApp(): Express | null;
}
