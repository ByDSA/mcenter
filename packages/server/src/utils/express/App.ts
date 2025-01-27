import { Express } from "express";

export interface App {
  init(): Promise<void>;
  listen(): Promise<void>;
  close(): Promise<void>;
  getExpressApp(): Express | null;
}
