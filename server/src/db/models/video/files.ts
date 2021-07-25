import { loadEnv } from "../../../env";
import { generateCommonFilesFunctions } from "../resource";

export const VIDEO_EXTENSIONS = ["mp4", "mkv", "avi", "wmv"];
loadEnv();

const generatedFunctions = generateCommonFilesFunctions( {
  extensions: VIDEO_EXTENSIONS,
  basePath: <string>process.env.VIDEOS_PATH,
} );

export const { calcHashFile,
  getFullPath,
  getRelativePath,
  findFiles,
  findFilesAt } = generatedFunctions;
