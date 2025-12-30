import { STATUS_CODES } from "node:http";

export class HttpError extends Error {
  constructor(status: number, msg?: string) {
    super(`Error HTTP ${status} ${STATUS_CODES[status] ?? ""}${msg ? ": " + msg : ""}`);
  }
}

export class HttpErrorUnauthorized extends HttpError {
  constructor(msg?: string) {
    super(401, msg);
  }
}

export class ErrorNoConnection extends Error {
  constructor() {
    super("No internet connection");
  }
}
