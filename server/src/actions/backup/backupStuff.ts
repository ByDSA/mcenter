/* eslint-disable import/prefer-default-export */
import { dynamicExecScript } from "@actions/utils/DynamicLoad";
import dotenv from "dotenv";
import { Backup, BackupPropsOptional } from "./Backup";

export async function backup() {
  dotenv.config();

  const { BACKUP_TARGET_FOLDER, BACKUP_TMP, BACKUP_FILE } = process.env;

  if (!BACKUP_FILE)
    throw new Error("No BACKUP_FILE env found");

  const props: BackupPropsOptional = {
    tempFolder: BACKUP_TMP,
    outFolder: BACKUP_TARGET_FOLDER,
  };
  const bckp = new Backup(props);
  const ret = await dynamicExecScript( {
    file: BACKUP_FILE,
    sample: sampleBackup,
    args: [bckp],
  } );

  if (!ret)
    return;

  await bckp.make();
}

const sampleBackup = `module.exports = function (backup) {
    console.log("Backup");
}`;
