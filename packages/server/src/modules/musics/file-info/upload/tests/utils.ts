import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import request from "supertest";
import { Application } from "express";
import { UploadFile } from "#utils/files";

type Props = {
  fileBuffer: Buffer;
  metadata: MusicFileInfoCrudDtos.UploadFile.RequestBody["metadata"];
  options?: {
    filename?: string;
    contentType?: string;
  };
  routerApp: Application;
};

export function uploadMusic( { fileBuffer, metadata, options, routerApp }: Props) {
  return request(routerApp)
    .post("/")
    .attach("file", fileBuffer, {
      filename: options?.filename ?? "test-audio.mp3",
      contentType: options?.contentType ?? "audio/mpeg",
    } )
    .field("metadata", JSON.stringify(metadata));
}

// Simulamos un archivo MP3 pequeño (cabecera ID3 vacía o datos aleatorios)
export const fileBuffer = Buffer.from("ID3......FAKE_AUDIO_DATA");

type UploadFileInMemory = Omit<UploadFile, "destination" | "filename" | "path" | "stream">;

export const mockFileInMemory: UploadFileInMemory = {
  buffer: fileBuffer,
  encoding: "7bit",
  fieldname: "file",
  mimetype: "audio/mpeg",
  originalname: "test-audio.mp3",
  size: fileBuffer.length,
};

export const mockFile: UploadFile = {
  ...mockFileInMemory,
  destination: "uploads/music",
  filename: "test-audio.mp3",
  path: "uploads/music/test-audio.mp3",
  stream: undefined!,
};
