import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import request from "supertest";
import { Application } from "express";
import { UploadFile } from "#utils/files";

type Props = {
  fileBuffer: Buffer;
  metadata: EpisodeFileInfoCrudDtos.UploadFile.RequestBody["metadata"];
  options?: {
    filename?: string;
    contentType?: string;
  };
  routerApp: Application;
};

export function uploadEpisodeFile( { fileBuffer, metadata, options, routerApp }: Props) {
  return request(routerApp)
    .post("/")
    .attach("file", fileBuffer, {
      filename: options?.filename ?? "test-video.mp4",
      contentType: options?.contentType ?? "video/mp4",
    } )
    .field("metadata", JSON.stringify(metadata));
}

// Simulamos un archivo de video pequeño
export const fileBuffer = Buffer.from("FAKE_VIDEO_DATA_HEADER....");

type UploadFileInMemory = Omit<UploadFile, "destination" | "filename" | "path" | "stream">;

export const mockFileInMemory: UploadFileInMemory = {
  buffer: fileBuffer,
  encoding: "7bit",
  fieldname: "file",
  mimetype: "video/mp4",
  originalname: "test-video.mp4",
  size: fileBuffer.length,
};

export const mockFile: UploadFile = {
  ...mockFileInMemory,
  destination: "uploads/series",
  filename: "test-video.mp4",
  path: "uploads/series/test-video.mp4",
  stream: undefined!,
};
