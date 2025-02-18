export class DatabaseNotConnectedError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Database is not connected");
  }
}
