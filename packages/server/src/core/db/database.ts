import mongoose, { ConnectOptions } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { Logger } from "@nestjs/common";

export type Options = {
  silent?: boolean;
  connectOptions?: ConnectOptions;
};

export type DatabaseConfig = {
  hostname?: string;
  database?: string;
  port?: string;
  username?: string;
  password?: string;
};

export class Database {
  #connected: boolean = false;

  #dropable: boolean = false;

  protected connection: mongoose.Connection | null = null;

  private readonly logger = new Logger(Database.name);

  #assertNotConnected() {
    if (this.#connected) {
      throw new Error(
        "Database is already connected. Disconnect first before connecting to a new database.",
      );
    }
  }

  #assertConnected() {
    if (!this.#connected)
      throw new Error("MongoDatabase not connected");
  }

  #generateUrl(config?: DatabaseConfig): string {
    // Usar config pasado o variables de entorno como fallback
    const hostname = config?.hostname ?? process.env.MONGO_HOSTNAME;
    const database = config?.database ?? process.env.MONGO_DB;
    const port = config?.port ?? process.env.MONGO_PORT;
    const username = config?.username ?? process.env.MONGO_USER;
    const password = config?.password ?? process.env.MONGO_PASSWORD;

    assertIsDefined(hostname);

    const isLocal = (port !== undefined || (hostname === "localhost" || hostname === "127.0.0.1"))
      && !hostname.includes("mongodb.net");
    let ret = `${isLocal ? "mongodb" : "mongodb+srv"}://`;

    if (username && password)
      ret += `${username}:${password}@`;

    ret += hostname;

    if (port)
      ret += `:${port}`;

    ret += `/${database}`;

    return ret;
  }

  async connect(config?: DatabaseConfig, options?: Options) {
    // Verificar que no esté ya conectado
    this.#assertNotConnected();

    // Configurar opciones (movido del constructor)
    const finalOptions: Options = {
      connectOptions: options?.connectOptions ?? {},
    };

    // Configurar logger silencioso si se especifica
    if (options?.silent) {
      this.logger.log = () => undefined;
      this.logger.error = () => undefined;
    }

    // Configurar opciones de mongoose
    finalOptions.connectOptions = {
      autoIndex: false,
      maxPoolSize: 10,
      bufferCommands: false, // Para que lance error si no hay una conexión a la DB
      autoCreate: false, // disable `autoCreate` since `bufferCommands` is false
      ...finalOptions.connectOptions,
    };

    if (config?.database !== undefined || config?.hostname !== undefined)
      this.#dropable = true;

    // Generar URL de conexión
    const dbConnectionURL = this.#generateUrl(config);

    this.logger.log(`Connecting to ${dbConnectionURL} ...`);
    mongoose.set("strictQuery", false);

    const connectPromise = mongoose.connect(dbConnectionURL, finalOptions.connectOptions);
    const { connection } = mongoose;

    connection.on(
      "error",
      () => this.logger.error(`Mongodb Connection Error: ${dbConnectionURL}\n`),
    );

    connection.once("open", () => {
      this.logger.log("Mongodb Connection Successful!");
      this.#connected = true;
    } );

    connection.once("close", () => {
      this.logger.log("Mongodb Connection Closed!");
      this.#connected = false;
    } );

    this.connection = connection;

    await connectPromise;
  }

  isConnected() {
    return this.#connected;
  }

  async dropAll() {
    if (!this.#dropable) {
      this.logger.warn("Database is not dropable. Skipping dropAll.");

      return;
    }

    await this.connection?.dropDatabase();
  }

  async disconnect() {
    this.logger.log("Disconnecting from mongodb ...");
    this.#assertConnected();
    await mongoose.disconnect();
  }
}
