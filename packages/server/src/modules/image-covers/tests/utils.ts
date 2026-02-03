import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import request from "supertest";
import { Application } from "express";
import { UploadFile } from "#utils/files";

type Props = {
  fileBuffer: Buffer;
  metadata: ImageCoverCrudDtos.UploadFile.RequestBody["metadata"];
  options?: {filename?: string;
contentType?: string;};
routerApp: Application;
};
export function uploadImage( { fileBuffer, metadata, options, routerApp }: Props) {
  return request(routerApp)
    .post("/image")
    .attach("file", fileBuffer, {
      filename: options?.filename ?? "test-image.png",
      contentType: options?.contentType ?? "image/png",
    } )
    .field("metadata", JSON.stringify(metadata));
}

export const fileBuffer = Buffer.from("fakeFile");
type UploadFileInMemory = Omit<UploadFile, "destination" | "filename" | "path" | "stream">;

export const mockFileInMemory: UploadFileInMemory = {
  buffer: fileBuffer,
  encoding: "7bit",
  fieldname: "file",
  mimetype: "image/png",
  originalname: "test-image.png",
  size: 8,
};

export const mockFile: UploadFile = {
  ...mockFileInMemory,
  destination: "destination",
  filename: "filename",
  path: "path",
  stream: undefined!,
};
