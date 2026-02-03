import { Type, NestInterceptor } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { uploadFileInterceptorOptions } from "../upload.service";

export const MemoryUploadFileInterceptor: Type<NestInterceptor> = FileInterceptor(
  "file",
  {
    ...uploadFileInterceptorOptions,
    storage: memoryStorage(),
  },
);
