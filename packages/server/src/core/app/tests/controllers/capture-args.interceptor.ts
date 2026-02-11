import { UserPayload } from "$shared/models/auth";
import { Injectable,
  NestMiddleware,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ArgumentMetadata,
  PipeTransform } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";
import { GlobalExceptionFilter } from "#core/error-handlers/http-error-handler";

type CapturedData = {
  // Fase 1: Middleware (siempre se ejecuta)
  initialRequest?: {
    method: string;
    url: string;
    params: Record<string, string>;
    body: any;
    headers: Record<string, string>;
  };

  // Fase 2: Después de guards (solo si pasan)
  afterGuards?: {
    user: UserPayload | null;
    params: Record<string, string>;
  };

  // Fase 4: Si hay error
  error?: {
    phase: "controller" | "dto-validation" | "guard" | "interceptor" | "middleware";
    stack?: string;
    message: string;
    statusCode: number;
  };

  pipeValidations?: {
    params: Set<string>; // IDs de parámetros que pasaron validación
    completed: boolean; // Marca si todos terminaron
  };
  afterController?: boolean;
};

@Injectable()
export class CaptureArgsMiddleware implements NestMiddleware {
  public capturedData: CapturedData = {};

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  use(req: Request, _res: Response, next: Function) {
    this.capturedData = {};
    // Captura SIEMPRE, antes de guards
    this.capturedData.initialRequest = {
      method: req.method,
      url: req.url,
      params: req.params,
      body: req.body,
      headers: req.headers as any,
    };

    next();
  }
}

@Injectable()
export class CaptureArgsInterceptor implements NestInterceptor {
  constructor(
    private readonly middleware: CaptureArgsMiddleware,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    this.middleware.capturedData.afterGuards = {
      user: req.user ?? null,
      params: req.params,
    };

    // Inicializar tracking de pipes
    this.middleware.capturedData.pipeValidations = {
      params: new Set(),
      completed: false,
    };

    return next.handle().pipe(
      tap(() => {
        // Si llegamos aquí, controller terminó OK
        this.middleware.capturedData.afterController = true;
      } ),
    );
  }
}

@Catch()
@Injectable()
export class CaptureArgsExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly middleware: CaptureArgsMiddleware,
    private readonly globalExceptionFilter: GlobalExceptionFilter,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const { afterGuards, pipeValidations, afterController } = this.middleware.capturedData;
    let phase: NonNullable<CapturedData["error"]>["phase"];

    if (!afterGuards)
      phase = "guard";
    else if (pipeValidations && !pipeValidations.completed) {
    // Pipes empezaron pero no todos completaron = error en DTO validation
      phase = "dto-validation";
    } else if (pipeValidations?.completed && !afterController) {
    // Todos los pipes pasaron pero controller no terminó = error en controller
      phase = "controller";
    } else {
    // Controller terminó = error en response/interceptor
      phase = "interceptor";
    }

    this.middleware.capturedData.error = {
      phase,
      stack: exception.stack,
      message: exception.message ?? "Unknown error",
      statusCode: exception.status ?? 500,
    };

    this.globalExceptionFilter.catch(exception, host);
  }
}

@Injectable()
export class CaptureAfterValidationPipe implements PipeTransform {
  constructor(private readonly middleware: CaptureArgsMiddleware) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const validations = this.middleware.capturedData.pipeValidations;

    if (validations && !validations.completed) {
      // Crear ID único para este parámetro
      const paramId = `${metadata.type}:${metadata.data ?? "unknown"}:${metadata.metatype?.name
        ?? "any"}`;

      validations.params.add(paramId);

      // Programar verificación asíncrona de que todos terminaron
      // setImmediate se ejecuta después de que TODOS los pipes síncronos terminen
      setImmediate(() => {
        if (validations && !validations.completed && !this.middleware.capturedData.error) {
          // Si llegamos aquí sin error, todos los pipes pasaron
          validations.completed = true;
        }
      } );
    }

    return value;
  }
}
