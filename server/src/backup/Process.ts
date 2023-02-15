/* eslint-disable import/no-cycle */
import { copyFile, makeDirIfNotExits } from "#modules/utils";
import { Backup } from "./Backup";

export default class Process {
  private promises: Promise<any>[];

  constructor(private backup: Backup) {
    this.promises = [];
  }

  async make() {
    for (const fi of this.backup.files) {
      this.addFile(fi.file, fi.subFolder)
        .catch((e) => {
          if (fi.required)
            throw e;
        } );
    }

    for (const f of this.backup.funcs) {
      const p = f();

      this.promises.push(p);
    }

    await this.waitPromises();
  }

  private async waitPromises() {
    await Promise.all(this.promises)
      .catch((e) => {
        throw e;
      } );
  }

  private async addFile(file: string, subFolder: string) {
    const target = `${this.backup.props.tempFolder}/${subFolder}/`;

    await makeDirIfNotExits(target);
    const p = copyFile(file, target).then((a) => {
      console.log(`${file} backuped! In: ${target}`);

      return a;
    } );

    this.promises.push(p);

    return p;
  }
}
