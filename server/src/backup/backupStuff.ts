import dotenv from "dotenv";
import { dynamicLoad } from "../DynamicLoad";
import { Backup, BackupPropsOptional } from "./Backup";

export async function backup() {
  dotenv.config();

  const { BACKUP_TARGET_FOLDER, BACKUP_TMP, BACKUP_FILE } = process.env;

  if (!BACKUP_FILE)
    throw new Error("No BACKUP_FILE env found");

  const props: BackupPropsOptional = {
    tempFolder: BACKUP_TMP,
    outFolder: BACKUP_TARGET_FOLDER,
  }

  const backup = new Backup(props);

  const ret = await dynamicLoad({ file: BACKUP_FILE, sample: sampleBackup, args: [backup] });

  if (!ret)
    return;

  await backup.make();
}

const sampleBackup = `module.exports = function (backup) {
    console.log("Backup");
}`;