import { Type, NestInterceptor } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { uploadFileInterceptorOptions } from "../service";

export const MemoryUploadFileInterceptor: Type<NestInterceptor> = FileInterceptor(
  "file",
  {
    ...uploadFileInterceptorOptions,
    storage: memoryStorage(),
  },
);
