import { loadEnv } from "@actions/utils/env";
import { generateCommonFilesFunctions } from "../genFuncs";

export const AUDIO_EXTENSIONS = ["mp3", "flac", "wma"];
loadEnv();

const generatedFunctions = generateCommonFilesFunctions( {
  extensions: AUDIO_EXTENSIONS,
  basePath: <string>process.env.MUSICS_PATH,
} );

export const { calcHashFile,
  getFullPath,
  getRelativePath,
  findFileByHash,
  findFiles,
  findFilesAt } = generatedFunctions;
