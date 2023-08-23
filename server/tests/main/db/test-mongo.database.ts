import { assertIsDefined } from "#utils/validation";
import { DatabaseOptions, RealMongoDatabase } from "#main";
import TestDatabase from "./TestDatabase";

export default class TestMongoDatabase extends RealMongoDatabase implements TestDatabase {
  constructor(options?: DatabaseOptions) {
    super( {
      ...options,
    } );
  }

  async drop() {
    assertIsDefined(this.connection);
    await this.connection.db.dropDatabase();
  }
}
