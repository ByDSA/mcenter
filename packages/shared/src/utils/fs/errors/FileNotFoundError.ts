export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(`path for '${ message }' not found`);
    this.name = "FileNotFoundError";
  }
}
