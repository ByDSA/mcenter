export default interface TestDatabase {
  drop(): Promise<void>;
}
