import { MongoMemoryServer } from "mongodb-memory-server";
import { TestRealDatabase } from "./test-real-database";
import { DatabaseOptions } from "#core";

export class TestMemoryDatabase extends TestRealDatabase {
  #mongoServer!: MongoMemoryServer;

  constructor(options?: DatabaseOptions) {
    super( {
      ...options,
    } );
  }

  async connect() {
    this.#mongoServer = await MongoMemoryServer.create();
    await super.connect();
  }

  protected generateUrl(): string {
    return this.#mongoServer.getUri();
  }

  async disconnect() {
    await super.disconnect();
    await this.#mongoServer.stop();
  }
}
