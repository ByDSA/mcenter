import { join } from "path";
import { Module, NestModule, MiddlewareConsumer, Logger } from "@nestjs/common";
import express from "express";
import serveIndex from "serve-index";
import { IMAGE_COVERS_FOLDER } from "#modules/image-covers/utils";

const mediaFolderPath = process.env.MEDIA_FOLDER_PATH;

@Module( {} )
export class StaticFilesModule implements NestModule {
  private readonly logger = new Logger(StaticFilesModule.name);

  configure(consumer: MiddlewareConsumer) {
    if (!mediaFolderPath) {
      this.logger.warn("MEDIA_FOLDER_PATH not defined");

      return;
    }

    for (const item of ["pelis", "series", "music"]) {
      consumer
        .apply(
          express.static(join(mediaFolderPath, item), {
            acceptRanges: false, // Evita que a veces salga el error de "Range Not Satisfiable"
          } ),
          serveIndex(join(mediaFolderPath, item), {
            view: "details",
            icons: true,
          } ),
        )
        .forRoutes(`/raw/${item}`);
    }

    for (const item of ["docs", IMAGE_COVERS_FOLDER]) {
      consumer
        .apply(
          express.static(join(mediaFolderPath, item), {
            acceptRanges: false, // Evita que a veces salga el error de "Range Not Satisfiable"
            setHeaders: (res) => {
              // Permite que cualquier dominio cargue el recurso
              res.set("Cross-Origin-Resource-Policy", "cross-origin");
            },
          } ),
        )
        .forRoutes(`/raw/${item}`);
    }
  }
}
