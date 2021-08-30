import { connect, disconnect } from "@db/index";
// eslint-disable-next-line import/no-cycle
import apiRoutes from "@routes/index";
import express, { Express } from "express";
import http from "http";
import { loadEnv } from "./actions/utils/env";

type Settings = {
  port: number;
  host: string;
};
type OnKillFunc = ()=> void;
type OnRunFunc = ()=> void;
export default class App {
    expressApp: Express | undefined;

    server: http.Server | undefined;

    private connections: any[] = [];

    private onKill: (OnKillFunc)[] = [];

    private onRun: (OnRunFunc)[] = [];

    private portNum: number;

    private hostStr: string;

    // eslint-disable-next-line accessor-pairs
    get port(): number {
      return this.portNum;
    }

    // eslint-disable-next-line accessor-pairs
    get host(): string {
      return this.hostStr;
    }

    // eslint-disable-next-line accessor-pairs
    get baseUrl(): string {
      return `http://${this.host}:${this.port}`;
    }

    constructor(settings: Settings) {
      this.portNum = settings.port;
      this.hostStr = settings.host;
    }

    async run() {
      process.chdir('files');

      loadEnv();

      await connect();

      this.createExpressApp();

      process.on("SIGTERM", this.shutDown);
      process.on("SIGINT", this.shutDown);

      this.server?.on("connection", (connection: any) => {
        this.connections.push(connection);
        connection.on("close", () => {
          this.connections = this.connections.filter((curr) => curr !== connection);

          return this.connections;
        } );
      } );

      for (const f of this.onRun)
        f();
    }

    addOnKill(f: OnKillFunc) {
      this.onKill.push(f);
    }

    addOnRun(f: OnRunFunc) {
      this.onRun.push(f);
    }

    private createExpressApp() {
      this.expressApp = express();

      this.expressApp.disable("x-powered-by");

      apiRoutes(this);

      this.server = this.expressApp.listen(this.portNum, () => {
        // console.log(`Example app listening at http://localhost:${port}`);
      } );
    }

    async kill() {
      for (const f of this.onKill)
        f();

      await disconnect();
      this.shutDown();
    }

    private shutDown() {
      this.server?.close();
      // this.server?.close(() => {
      //   process.exit(0);
      // } );

      // // Por si no se cierra correctamente
      // setTimeout(() => {
      //   process.exit(1);
      // }, 10000);

      this.connections.forEach((curr) => curr.end());
      setTimeout(() => this.connections.forEach((curr) => curr.destroy()), 5000);
    }
}

export {
  loadEnv,
};
