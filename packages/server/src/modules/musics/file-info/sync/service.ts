import { existsSync } from "node:fs";
import { Injectable } from "@nestjs/common";
import { getAbsolutePath } from "#musics/utils";
import { md5FileAsync } from "#utils/crypt";
import { MusicFileInfoRepository } from "../crud/repository";
import { MusicFileInfoEntity } from "../models";

@Injectable()
export class MusicFileInfoSyncService {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
  ) {}

  async syncOffloaded(fileInfo: MusicFileInfoEntity): Promise<"marked" | "unmarked" | null> {
    const relativePath = fileInfo.path;
    const fullPath = getAbsolutePath(relativePath);
    const fileExists = existsSync(fullPath);

    if (fileExists) {
      if (fileInfo.offloaded !== true)
        return null; // Existe y no estaba como offloaded → no hacer nada

      // Existe pero estaba como offloaded → verificar hash
      const currentHash = await md5FileAsync(fullPath);

      if (currentHash === fileInfo.hash) {
        // Hash coincide → quitar offloaded
        await this.fileInfosRepo.patchOneById(fileInfo.id, {
          unset: [
            ["offloaded"],
          ],
          entity: {},
        } );

        return "unmarked";
      }

      // Hash diferente → dejar como offloaded (el archivo actual es distinto)
      return null;
    }

    if (fileInfo.offloaded !== true) {
      // No existe y no estaba como offloaded → marcar como offloaded
      await this.fileInfosRepo.patchOneById(fileInfo.id, {
        entity: {
          offloaded: true,
        },
      } );

      return "marked";
    }

    return null; // No existe y ya estaba como offloaded → no hacer nada
  }
}
