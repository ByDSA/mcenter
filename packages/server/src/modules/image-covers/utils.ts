import path from "node:path";
import { ENVS } from "#musics/utils";

export const IMAGE_COVERS_FOLDER = "image-covers";

export const IMAGE_COVERS_FOLDER_PATH = path.join(ENVS.mediaPath, IMAGE_COVERS_FOLDER);
