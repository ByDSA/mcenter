import { execSync } from "child_process";
import { createFolder } from "../Utils";

type Options = {
  host: string;
  pass: string;
  user: string;
  db: string;
};

export class BackupWiki {
  private opts: Options;
  constructor(private backupFolder: string) {
    const {
      WIKI_DB_USER,
      WIKI_DB_HOST,
      WIKI_DB_NAME,
      WIKI_DB_PASS,
    } = process.env;

    if (!WIKI_DB_USER
      || !WIKI_DB_HOST
      || WIKI_DB_PASS === undefined
      || !WIKI_DB_NAME)
      throw new Error();

    this.opts = {
      host: WIKI_DB_HOST,
      pass: WIKI_DB_PASS,
      user: WIKI_DB_USER,
      db: WIKI_DB_NAME
    }
  }

  private makeCmd() {
    const { host, pass, user, db } = this.opts;
    const file = this.getFilename();
    return `PGPASSWORD=${pass} pg_dump -h ${host} -U ${user} -v -Fc ${db} > ${file}`
  }

  private createFolder() {
    return createFolder(this.getFolderName());
  }

  private getFolderName() {
    return this.backupFolder + "/wiki";
  }

  private getFilename() {
    return this.getFolderName() + "/" + "wiki.db";
  }

  async do() {
    await this.createFolder()
    const cmd = this.makeCmd();
    execSync(cmd);
    console.log("Generated file: " + this.getFilename());
    console.log("Wiki backup done!");
  }
}