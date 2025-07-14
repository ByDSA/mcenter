import { join } from "path";
import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import express from "express";
import serveIndex from "serve-index";

const mediaFolderPath = process.env.MEDIA_FOLDER_PATH;

@Module( {} )
export class StaticFilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (!mediaFolderPath) {
      console.warn("MEDIA_FOLDER_PATH not defined");

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

    for (const item of ["docs"]) {
      consumer
        .apply(
          express.static(join(mediaFolderPath, item), {
            acceptRanges: false, // Evita que a veces salga el error de "Range Not Satisfiable"
          } ),
        )
        .forRoutes(`/raw/${item}`);
    }
  }
}
