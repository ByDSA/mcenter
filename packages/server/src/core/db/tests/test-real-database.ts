import { assertIsDefined } from "$shared/utils/validation";
import { Logger } from "@nestjs/common";
import { Database } from "#core";

export class TestRealDatabase extends Database {
  async connect() {
    await super.connect();
    await this.dropAll();
  }

  async dropAll() {
    assertIsDefined(this.connection);
    new Logger().log("Dropping database ...");
    await this.connection.db.dropDatabase();
  }
}
