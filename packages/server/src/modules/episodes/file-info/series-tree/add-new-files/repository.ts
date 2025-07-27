import path from "node:path";
import { assertIsDefined } from "$shared/utils/validation";
import { Injectable } from "@nestjs/common";
import { findAllSerieFolderTreesAt } from "#episodes/file-info";

@Injectable()
export class AddNewFilesRepository {
  // eslint-disable-next-line require-await
  async getLocalSeriesTree() {
    const { MEDIA_FOLDER_PATH } = process.env;

    assertIsDefined(MEDIA_FOLDER_PATH);

    const seriesPath = path.join(MEDIA_FOLDER_PATH, "series");
    const filesSerieTreeResult = findAllSerieFolderTreesAt(seriesPath, {
      baseFolder: "series/",
    } );

    return filesSerieTreeResult;
  }
}
