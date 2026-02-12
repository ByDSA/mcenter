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

export enum Phase {
  middleware = 0,
  guard = 1,
  dtoValidation = 2,
  controller = 3,
  afterController = 4,
  finished = 5,
}

type CapturedData = {
  currentPhase: Phase;

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
    phase: Phase;
    stack?: string;
    message: string;
    statusCode: number;
  };

  pipeValidations?: {
    startedCount: number; // Cuántos parámetros empezaron a validarse
    completedCount: number; // Cuántos parámetros completaron validación
  };
};

@Injectable()
export class CaptureArgsMiddleware implements NestMiddleware {
  public capturedData: CapturedData = {
    currentPhase: Phase.middleware,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  use(req: Request, res: Response, next: Function) {
    this.capturedData = {
      currentPhase: Phase.middleware,
    };

    // Captura SIEMPRE, antes de guards
    this.capturedData.initialRequest = {
      method: req.method,
      url: req.url,
      params: req.params,
      body: req.body,
      headers: req.headers as any,
    };

    // Avanzar a la siguiente fase
    this.capturedData.currentPhase = Phase.guard;

    res.on("finish", () => {
      // Esto se ejecuta DESPUÉS de todo (interceptors + filters)
      // Solo cambiar a finished si no hubo error
      if (!this.capturedData.error
          && this.capturedData.currentPhase === Phase.afterController)
        this.capturedData.currentPhase = Phase.finished;
    } );

    next();
  }

  /**
   * Obtiene la fase actual del request
   * Puede ser llamado externamente o desde el filter
   */
  getPhase(): Phase {
    return this.capturedData.currentPhase;
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

    this.middleware.capturedData.pipeValidations = {
      startedCount: 0,
      completedCount: 0,
    };

    this.middleware.capturedData.currentPhase = Phase.dtoValidation;

    return next.handle().pipe(
      tap(() => {
        // Controller terminó, antes de otros interceptors
        this.middleware.capturedData.currentPhase = Phase.afterController;
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
    // Obtener la fase actual directamente
    const currentPhase = this.middleware.getPhase();

    this.middleware.capturedData.error = {
      phase: currentPhase,
      stack: exception.stack,
      message: exception.message ?? "Unknown error",
      statusCode: exception.status ?? 500,
    };

    this.globalExceptionFilter.catch(exception, host);
  }
}

// Este pipe se ejecuta ANTES de ZodValidationPipe
@Injectable()
export class CaptureBeforeValidationPipe implements PipeTransform {
  constructor(private readonly middleware: CaptureArgsMiddleware) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const validations = this.middleware.capturedData.pipeValidations;

    if (validations)
      validations.startedCount++;

    return value;
  }
}

// Este pipe se ejecuta DESPUÉS de ZodValidationPipe
@Injectable()
export class CaptureAfterValidationPipe implements PipeTransform {
  constructor(private readonly middleware: CaptureArgsMiddleware) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const validations = this.middleware.capturedData.pipeValidations;

    if (validations) {
      validations.completedCount++;

      // Si todos los pipes completaron, avanzar a la fase del controller
      if (validations.completedCount === validations.startedCount)
        this.middleware.capturedData.currentPhase = Phase.controller;
    }

    return value;
  }
}
