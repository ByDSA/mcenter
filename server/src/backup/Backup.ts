/* eslint-disable import/no-cycle */
import { DateTime } from "luxon";
import { compress, deleteFolder, makeDir, makeDirIfNotExits, moveFile, pgDump } from "../Utils";
import Process from "./Process";

export type BackupProps = {
  tempFolder: string;
  outFolder: string;
}

export type BackupPropsOptional = {
  tempFolder?: string;
  outFolder?: string;
}

const defaultProps: BackupProps = {
  tempFolder: "./backupTmp",
  outFolder: "/",
};

export type FileInfo = {
  file: string;
  required: boolean;
  subFolder: string;
}

type AddFileProps = {
  file: string;
  required?: boolean;
  subFolder?: string;
}

type AddFilesProps = {
  files: string[];
  required?: boolean;
  subFolder?: string;
}

type PGDBOptions = {
  host: string;
  pass: string;
  user: string;
  db: string;
  file: string;
  subfolder: string;
};

export class Backup {
  props: BackupProps;

  files: FileInfo[];

  funcs: (()=> Promise<any>)[];

  constructor(props: BackupPropsOptional) {
    this.props = {
      ...defaultProps,
    };
    this.props.outFolder = props.outFolder || defaultProps.outFolder;
    this.props.tempFolder = props.tempFolder || defaultProps.tempFolder;
    this.files = [];
    this.funcs = [];
  }

  private async createTmpFolder() {
    const { tempFolder } = this.props;

    console.log(`Creating temp folder at ${tempFolder}...`);
    await makeDir(tempFolder).catch(async (p) => {
      try {
        await deleteFolder(tempFolder);
        await makeDir(tempFolder);
      } catch (e) {
        throw p;
      }

      return p;
    } );
  }

  async make() {
    await this.createTmpFolder();
    await new Process(this).make();

    const { tempFolder } = this.props;
    const date = DateTime.now();
    const timestamp = `${date.year}${date.month + 1}${date.day}${date.hour}${date.minute}${date.second}`;
    const compressedFile = `backup-${timestamp}.tar.gz`;
    const outFile = `${tempFolder}/../${compressedFile}`;

    await this.compress(outFile);

    console.log("Moving file...");
    await moveFile(outFile, `${this.props.outFolder}/`);

    await this.deleteTmpFolder();

    console.log("Done!");
  }

  private async deleteTmpFolder() {
    console.log("Deleting backup temporal folder...");
    await deleteFolder(this.props.tempFolder);
  }

  addFile( { file, required = true, subFolder = "." }: AddFileProps) {
    this.files.push( {
      file,
      required,
      subFolder,
    } );
  }

  addFunc(f: ()=> Promise<any>) {
    this.funcs.push(f);
  }

  addFiles( { files, required = true, subFolder = "." }: AddFilesProps) {
    for (const file of files) {
      this.addFile( {
        file,
        required,
        subFolder,
      } );
    }
  }

  addPGDB( { host, pass, user, db, file, subfolder = "." }: PGDBOptions) {
    this.addFunc(() => {
      const folder = `${this.props.tempFolder}/${subfolder}`;

      makeDirIfNotExits(folder);

      const path = `${folder}/${file}`;

      return pgDump( {
        host,
        pass,
        user,
        db,
        file: path,
      } );
    } );
  }

  private compress(outFile: string) {
    console.log("Compressing...");

    return compress( {
      outFile,
      folder: this.props.tempFolder,
    } );
  }
}
