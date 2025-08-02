import { MongoMemoryServer } from "mongodb-memory-server";
import { DatabaseOptions } from "#main";
import { TestRealDatabase } from "./test-real-database";

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
