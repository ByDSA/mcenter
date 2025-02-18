import { Database } from "#utils/layers/db";

export interface TestDatabase extends Database {
  drop(): Promise<void>;
}
