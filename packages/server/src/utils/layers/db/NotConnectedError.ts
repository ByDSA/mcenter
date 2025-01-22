export default class NotConnectedError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Database is not connected");
  }
}
