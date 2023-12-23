import { Express } from "express";

export default interface App {
  init(): Promise<void>;
  listen(): Promise<void>;
  close(): Promise<void>;
  getExpressApp(): Express | null;
}
