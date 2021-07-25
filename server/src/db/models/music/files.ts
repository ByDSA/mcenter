import { loadEnv } from "../../../env";
import { generateCommonFilesFunctions } from "../resource";

export const AUDIO_EXTENSIONS = ["mp3", "flac", "wma"];
loadEnv();

const generatedFunctions = generateCommonFilesFunctions( {
  extensions: AUDIO_EXTENSIONS,
  basePath: <string>process.env.MUSICS_PATH,
} );

export const { calcHashFile,
  getFullPath,
  getRelativePath,
  findFiles,
  findFilesAt } = generatedFunctions;
