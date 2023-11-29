import { Express } from "express";

export default interface App {
  init(): Promise<void>;
  listen(): void;
  close(): Promise<void>;
  getExpressApp(): Express | null;
}
