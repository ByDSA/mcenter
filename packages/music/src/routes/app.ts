import { MusicController } from "#modules/musics";
import express, { Express } from "express";
import http from "http";
import { connect, disconnect } from "../db/database";
import { assertEnv } from "../env";

type Params = {
  musicController: MusicController;
};

type OnKillFunc = ()=> void;
type OnRunFunc = ()=> void;
export default class App {
  expressApp: Express | undefined;

  server: http.Server | undefined;

  #connections: any[] = [];

  #onKill: (OnKillFunc)[] = [];

  #onRun: (OnRunFunc)[] = [];

  #musicController: MusicController;

  constructor( {musicController}: Params) {
    this.#musicController = musicController;
  }

  async run() {
    assertEnv();

    await connect();

    this.createExpressApp();

    process.on("SIGTERM", this.shutDown);
    process.on("SIGINT", this.shutDown);

    this.server?.on("connection", (connection: any) => {
      this.#connections.push(connection);
      connection.on("close", () => {
        this.#connections = this.#connections.filter((curr) => curr !== connection);

        return this.#connections;
      } );
    } );

    for (const f of this.#onRun)
      f();
  }

  addOnKill(f: OnKillFunc) {
    this.#onKill.push(f);
  }

  addOnRun(f: OnRunFunc) {
    this.#onRun.push(f);
  }

  private createExpressApp() {
    this.expressApp = express();

    this.expressApp.disable("x-powered-by");

    this.expressApp.use("/api", this.#musicController.getRouter());

    const PORT: number = +(process.env.PORT ?? 8080);

    this.server = this.expressApp.listen(PORT, () => {
      console.log(`Example app listening at http://localhost:${PORT}`);
    } );
  }

  async kill() {
    for (const f of this.#onKill)
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

    this.#connections.forEach((curr) => curr.end());
    setTimeout(() => this.#connections.forEach((curr) => curr.destroy()), 5000);
  }
}
