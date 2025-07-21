import mongoose, { ConnectOptions } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";

export type Options = ConnectOptions;

export class Database {
  #options: ConnectOptions;

  #dbConnectionURL: string;

  #connected: boolean;

  protected connection: mongoose.Connection | null = null;

  constructor(options?: Options) {
    this.#options = options ?? {};

    this.#dbConnectionURL = "";
    this.#connected = false;
  }

  #init() {
    // mongoose options
    this.#options = {
      autoIndex: false,
      maxPoolSize: 10,
      bufferCommands: false, // Para que lance error si no hay una conexión a la DB
      autoCreate: false, // disable `autoCreate` since `bufferCommands` is false, value)
      ...this.#options,
    };

    this.#dbConnectionURL = this.generateUrl();
  }

  #assertConnected() {
    if (!this.#connected)
      throw new Error("MongoDatabase not connected");
  }

  async connect() {
    this.#init();
    console.log(`Connecting to ${this.#dbConnectionURL} ...`);
    mongoose.set("strictQuery", false);
    const connectPromise = mongoose.connect(this.#dbConnectionURL, this.#options);
    const { connection } = mongoose;

    connection.on(
      "error",
      console.error.bind(console, `Mongodb Connection Error: ${this.#dbConnectionURL}\n`),
    );
    connection.once("open", () => {
      console.log("Mongodb Connection Successful!");

      this.#connected = true;
    } );
    connection.once("close", () => {
      console.log("Mongodb Connection Closed!");

      this.#connected = false;
    } );

    this.connection = connection;

    await connectPromise;
  }

  async disconnect() {
    console.log("Disconnecting from mongodb ...");
    this.#assertConnected();
    await mongoose.disconnect();
  }

  protected generateUrl() {
    // mongodb environment variables
    const { MONGO_HOSTNAME,
      MONGO_DB,
      MONGO_PORT,
      MONGO_USER,
      MONGO_PASSWORD } = process.env;

    assertIsDefined(MONGO_HOSTNAME);

    const isLocal = (MONGO_PORT !== undefined || (MONGO_HOSTNAME === "localhost"
      || MONGO_HOSTNAME === "127.0.0.1")) && !MONGO_HOSTNAME.includes("mongodb.net");
    let ret = `${isLocal ? "mongodb" : "mongodb+srv"}://`;

    if (MONGO_USER && MONGO_PASSWORD)
      ret += `${MONGO_USER}:${MONGO_PASSWORD}@`;

    ret += MONGO_HOSTNAME;

    if (MONGO_PORT)
      ret += `:${MONGO_PORT}`;

    ret += `/${MONGO_DB}`;

    return ret;
  }
}
