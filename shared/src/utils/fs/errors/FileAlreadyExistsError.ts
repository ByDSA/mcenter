export default class FileAlreadyExistsError extends Error {
  constructor(path: string) {
    super(`file or folder already exists: ${ path }`);
    this.name = "FileAlreadyExistsError";
  }
}