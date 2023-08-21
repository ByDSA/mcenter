import { assertIsDefined } from "#utils/validation";
import express, { Express } from "express";
import { Server } from "node:http";
import https from "node:https";
import { Components, initializeComponents } from "./components";
import { GlobalConfig, GlobalConfigOptions } from "./config";

type Options = {
  components?: Components;
  config?: GlobalConfigOptions;
};

export default class App {
  private $options?: Options;

  private $expressApp!: Express;

  private $openServers: Server[] = [];

  private $config!: GlobalConfig;

  public static create(options?: Options) {
    return new App(options);
  }

  private constructor(options?: Options) {
    this.$options = options;

    this.initialize(this.$options?.config);
  }

  private initialize(config?: GlobalConfigOptions) {
    this.$expressApp = express();
    const components = this.$options?.components;

    this.$config = this.initializeConfig(config);

    if (components) {
      initializeComponents( {
        app:this.$expressApp,
        components,
      } );
    }

    this.$expressApp.get("/", (req, res) => {
      res.send("El servicio está en funcionamiento");
    } );
  }

  // eslint-disable-next-line class-methods-use-this
  protected initializeConfig(options?: GlobalConfigOptions) {
    const config = GlobalConfig.create(options);

    config.initialize();

    return config;
  }

  run(): Server | null {
    if (this.$openServers.length > 0)
      return null;

    const {port} = this.$config.net;
    const sslConfig = this.$config.net.ssl;
    const httpsEnabled = sslConfig.enabled;
    let server: Server;

    if (httpsEnabled) {
      const keyFile = sslConfig.key;
      const certFile = sslConfig.cert;

      assertIsDefined(keyFile?.content);
      assertIsDefined(certFile?.content);

      const credentials = {
        key: keyFile.content,
        cert: certFile.content,
      };
      const httpsServer = https.createServer(credentials, this.getExpressApp());

      server = httpsServer.listen(port, () => {
        console.log("Listening (HTTPS) on port:", port);
      } );
    } else {
      server = this.getExpressApp().listen(port, () => {
        console.log("Listening (HTTP) on port:", port);
      } );
    }

    this.$openServers.push(server);

    return server;
  }

  close() {
    while (this.$openServers.length > 0) {
      const server = this.$openServers.pop();

      if (server)
        server.close();
    }
  }

  getServers() {
    return this.$openServers;
  }

  getConfig() {
    return this.$config;
  }

  getExpressApp() {
    return this.$expressApp;
  }
}
