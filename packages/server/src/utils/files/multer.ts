import { existsSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { applyDecorators, BadRequestException, CallHandler, ExecutionContext, HttpCode, HttpStatus, Injectable, NestInterceptor, Post, Type, UseInterceptors } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { DiskStorageOptions } from "multer";
import { Express } from "express";
import { z, ZodObject, ZodRawShape } from "zod";
import { createZodDto } from "nestjs-zod";
import { Observable } from "rxjs";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { generateUniqueFilename } from "./utils";

export const BAD_MIME_TYPE_EXCEPTION = new BadRequestException("Tipo de archivo no permitido");

export const fileMimeTypeFilter: ((allowedMimes: string[])=> MulterOptions["fileFilter"]) = (
  allowedMimes: string[],
)=>(
  _req,
  file,
  callback,
) => {
  if (!allowedMimes.includes(file.mimetype)) {
    callback(BAD_MIME_TYPE_EXCEPTION, false);

    return;
  }

  callback(null, true);
};

export const diskStorageUniqueFilename: ()=> DiskStorageOptions["filename"] = ()=> (
  _req,
  file,
  callback,
) => {
  const uniqueName = generateUniqueFilename(file.originalname);

  callback(null, uniqueName);
};

type DiskStorageEnsureDestination =
  (folderPath: string)=> DiskStorageOptions["destination"];
export const diskStorageEnsureDestination: DiskStorageEnsureDestination = (folderPath)=> (
  _req,
  _file,
  callback,
) => {
  // Crear directorio si no existe
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, {
      recursive: true,
    } );
  }

  callback(null, folderPath);
};

// eslint-disable-next-line no-underscore-dangle
const _expressType: Express = null as any; // Para que no borre el import de Express

export type UploadFile = Express.Multer.File;

export type UploadFileProps<DTO> = {
  file: UploadFile;
  uploadDto: DTO;
  uploaderUserId: string;
};

function assertValidFile(file: UploadFile) {
  if (!file)
    throw new BadRequestException("No se ha proporcionado archivo");
}

const isJsonString = (value: unknown): value is string => {
  return (
    typeof value === "string"
    && (value.trim().startsWith("{") || value.trim().startsWith("["))
  );
};

/**
 * Crea un DTO que pre-procesa campos multipart/form-data (JSON strings y números)
 * manteniendo la inferencia de tipos estricta.
 */
export function createMulterDto<Shape extends ZodRawShape>(
  schema: ZodObject<Shape>,
) {
  const { shape } = schema;
  // Creamos un esquema aumentado con pre-procesamiento
  const augmentedSchema = z.preprocess((formData) => {
    // Si no es un objeto o es null, devolvemos tal cual para que Zod falle después si es necesario
    if (typeof formData !== "object" || formData === null)
      return formData;

    // Copiamos los datos para no mutar la entrada original
    const processedData = {
      ...formData,
    } as Record<string, any>;

    // Iteramos sobre las claves definidas en el esquema original
    // eslint-disable-next-line no-restricted-syntax
    for (const key in shape) {
      const schemaDef = shape[key];
      const value = processedData[key];

      // Chequeo de seguridad: asegurar que schemaDef existe
      if (!schemaDef)
        continue;

      const isZodString = schemaDef instanceof z.ZodString;

      // 1. Intentar parsear JSON si el campo no es explícitamente un string simple
      //    y parece un string JSON
      if (!isZodString && isJsonString(value)) {
        try {
          processedData[key] = JSON.parse(value);
        } catch {
          // Si falla el parseo, dejamos el valor original; Zod se encargará de validar
        }
      }

      // 2. Convertir strings numéricos a números reales si el esquema espera un número
      if (
        schemaDef instanceof z.ZodNumber
        && typeof value === "string"
        && value.trim() !== ""
        && !isNaN(Number(value))
      )
        processedData[key] = Number(value);
    }

    return processedData;
  }, schema);

  // CRUCIAL: Hacemos cast a ZodObject<Shape> para que createZodDto
  // vea la estructura original exacta y no un ZodEffects o un Any.
  return createZodDto(augmentedSchema as unknown as ZodObject<Shape>);
}
// assertValidFile(file);
type UserUploadFileOptions = {
  responseSchema?: z.ZodTypeAny;
  fileInterceptor: Type<NestInterceptor>;
};
export function UserUploadFile(
  url: string,
  options: UserUploadFileOptions,
) {
  return applyDecorators(
    ...[
      IsAdmin(), // TODO: filtro role uploader
      Post(url),
      UseInterceptors(options.fileInterceptor),
      UseInterceptors(FileValidationInterceptor),
      options.responseSchema && ValidateResponseWithZodSchema(
        options.responseSchema,
        {
          failMsg: "Error al validar el schema de UserUploadFile",
        },
      ),
      HttpCode(HttpStatus.OK),
    ].filter(Boolean) as Array<ClassDecorator | MethodDecorator | PropertyDecorator>,
  );
}

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { file } = request;

    assertValidFile(file);

    return next.handle();
  }
}

export function createUploadFileSuccessResponse<T extends object>(data: T) {
  return {
    message: "Archivo subido exitosamente",
    data,
  };
}
