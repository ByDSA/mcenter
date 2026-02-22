import path from "node:path";
import { existsSync } from "node:fs";
import { Injectable } from "@nestjs/common";
import { EpisodeFileInfoRepository } from "../crud/repository";
import { EpisodeFileInfoEntity } from "../models";
import { EPISODES_MEDIA_PATH } from "#episodes/utils";
import { md5FileAsync } from "#utils/crypt";

@Injectable()
export class EpisodeFileInfoSyncService {
  constructor(
    private readonly fileInfosRepo: EpisodeFileInfoRepository,
  ) {}

  async syncOffloaded(fileInfo: EpisodeFileInfoEntity): Promise<"marked" | "unmarked" | null> {
    const relativePath = fileInfo.path;
    const fullPath = path.join(EPISODES_MEDIA_PATH, relativePath);
    const fileExists = existsSync(fullPath);

    if (fileExists) {
      if (fileInfo.offloaded !== true)
        return null; // Existe y no estaba como offloaded → no hacer nada

      // Existe pero estaba como offloaded → verificar hash
      const currentHash = await md5FileAsync(fullPath);

      if (currentHash === fileInfo.hash) {
        // Hash coincide → quitar offloaded
        await this.fileInfosRepo.patchOffloaded(fileInfo.id, false);

        return "unmarked";
      }

      // Hash diferente → dejar como offloaded (el archivo actual es distinto)
      return null;
    }

    if (fileInfo.offloaded !== true) {
      // No existe y no estaba como offloaded → marcar como offloaded
      await this.fileInfosRepo.patchOffloaded(fileInfo.id, true);

      return "marked";
    }

    return null; // No existe y ya estaba como offloaded
  }
}
