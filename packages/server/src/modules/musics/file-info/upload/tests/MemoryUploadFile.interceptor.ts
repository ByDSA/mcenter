import { Type, NestInterceptor } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { uploadFileInterceptorOptions } from "../service";

// Sobrescribimos el almacenamiento a memoria para no escribir en disco en los tests unitarios
// Mantenemos los filtros de archivo (MIME types) del servicio original
export const MemoryUploadFileInterceptor: Type<NestInterceptor> = FileInterceptor(
  "file",
  {
    ...uploadFileInterceptorOptions,
    storage: memoryStorage(),
  },
);
