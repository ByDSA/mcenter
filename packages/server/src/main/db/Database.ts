import mongoose, { ConnectOptions } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { Logger } from "@nestjs/common";

export type Options = {
  silent?: boolean;
  connectOptions?: ConnectOptions;
};

export class Database {
  #options: Options;

  #dbConnectionURL: string;

  #connected: boolean;

  protected connection: mongoose.Connection | null = null;

   private readonly logger = new Logger(Database.name);

   constructor(options?: Options) {
     this.#options = {
       connectOptions: options?.connectOptions ?? {},
     };

     if (options?.silent) {
       this.logger.log = ()=>undefined;
       this.logger.error = ()=>undefined;
     }

     this.#dbConnectionURL = "";
     this.#connected = false;
   }

   #init() {
     // mongoose options
     this.#options.connectOptions = {
       autoIndex: false,
       maxPoolSize: 10,
       bufferCommands: false, // Para que lance error si no hay una conexión a la DB
       autoCreate: false, // disable `autoCreate` since `bufferCommands` is false, value)
       ...this.#options.connectOptions,
     };

     this.#dbConnectionURL = this.generateUrl();
   }

   #assertConnected() {
     if (!this.#connected)
       throw new Error("MongoDatabase not connected");
   }

   async connect() {
     this.#init();
     this.logger.log(`Connecting to ${this.#dbConnectionURL} ...`);
     mongoose.set("strictQuery", false);
     const connectPromise = mongoose.connect(this.#dbConnectionURL, this.#options.connectOptions);
     const { connection } = mongoose;

     connection.on(
       "error",
       ()=>this.logger.error(`Mongodb Connection Error: ${this.#dbConnectionURL}\n`),
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

   async disconnect() {
     this.logger.log("Disconnecting from mongodb ...");
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
