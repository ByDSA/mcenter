import { assertIsDefined } from "$shared/utils/validation";
import { DatabaseOptions, Database } from "#main";

export class TestRealDatabase extends Database {
  constructor(options?: DatabaseOptions) {
    super( {
      ...options,
    } );
  }

  async connect() {
    await super.connect();
    await this.drop();
  }

  async drop() {
    assertIsDefined(this.connection);
    console.log("Dropping database ...");
    await this.connection.db.dropDatabase();
  }
}
