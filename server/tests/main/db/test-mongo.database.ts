import RealMongoDatabase, { Options } from "@app/main/db/real-mongo.database";
import { assertDefined } from "@app/utils";
import TestDatabase from "./TestDatabase";

export default class TestMongoDatabase extends RealMongoDatabase implements TestDatabase {
  constructor(options?: Options) {
    super( {
      ...options,
      envFilePath: "tests/.env",
    } );
  }

  async drop() {
    assertDefined(this.connection);
    await this.connection.db.dropDatabase();
  }
}
