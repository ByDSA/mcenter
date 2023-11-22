import { Database } from "#utils/layers/db";

export default interface TestDatabase extends Database {
  drop(): Promise<void>;
}
