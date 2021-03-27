import dotenv from "dotenv";
import { getNowTimestamp } from "../TimeUtils";
import { copyFile, createFolder, deleteFolder, execPromisify, moveFile } from "../Utils";
import { BackupWiki } from "./backupWiki";

export async function backup() {
  dotenv.config();

  const { BACKUP_TMP_FOLDER, BACKUP_TARGET_FOLDER } = process.env;
  if (!BACKUP_TMP_FOLDER || !BACKUP_TARGET_FOLDER)
    throw new Error();

  if (!await createFolder(BACKUP_TMP_FOLDER)) {
    if (!await deleteFolder(BACKUP_TMP_FOLDER) || !await createFolder(BACKUP_TMP_FOLDER))
      throw new Error();
  }

  const backupWikiPromise = new BackupWiki(BACKUP_TMP_FOLDER).do();

  const backupInfoPromise = backupInfo(BACKUP_TMP_FOLDER);
  const backupCrontabPromise = backupCrontab(BACKUP_TMP_FOLDER);

  await Promise.all([backupWikiPromise, backupInfoPromise, backupCrontabPromise])
    .catch(() => {
      throw new Error();
    })

  const compressedFile = "backup-" + getNowTimestamp() + ".tar.gz";
  const outFile = BACKUP_TMP_FOLDER + "/../" + compressedFile;

  console.log("Compressing...");
  await compress({
    outFile,
    folder: BACKUP_TMP_FOLDER
  });

  console.log("Moving file...");
  await moveFile(outFile, BACKUP_TARGET_FOLDER + "/");

  console.log("Deleting backup tamporal folder...");
  await deleteFolder(BACKUP_TMP_FOLDER);

  console.log("Done!");
}

async function backupInfo(backupFolder: string) {
  const { INFO_FILE } = process.env;
  if (!INFO_FILE) {
    console.log("No info file found.");
    return;
  }
  await copyFile(INFO_FILE, backupFolder);
}

async function backupCrontab(backupFolder: string) {
  const { CRONTAB } = process.env;
  if (!CRONTAB)
    throw new Error();
  await copyFile(CRONTAB, backupFolder);
  console.log("Crontab backuped!");
}

type CompressParams = {
  folder: string;
  outFile: string;
}
async function compress({ folder, outFile }: CompressParams) {
  return execPromisify(`tar -czf ${outFile} -C ${folder} .`)
    .then(() => {
      console.log("Compressed " + folder + " to " + outFile);
    })
    .catch(() => false);
}