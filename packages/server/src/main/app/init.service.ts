import { Server } from "node:http";
import { HttpAdapterHost } from "@nestjs/core";
import { ArgumentMetadata, INestApplication, Injectable, OnModuleInit, PipeTransform, Logger } from "@nestjs/common";
import helmet from "helmet";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationException, ZodValidationPipe } from "nestjs-zod";
import { assertIsDefined } from "$shared/utils/validation";
import { CustomValidationError } from "$shared/utils/validation/zod";
import { GlobalExceptionFilter } from "#main/error-handlers/http-error-handler";
import { RemotePlayerWebSocketsServerService, VlcBackWebSocketsServerService } from "#modules/player";
import { ZodSerializerSchemaInterceptor } from "#utils/validation/zod-nestjs";
import { setupEventEmitterDecorators } from "#main/domain-event-emitter/get-event-emitter";
import { LoggingInterceptor } from "../logging/interceptor";
import { Cleanup } from "./clean-up.service";

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly vlcBackWebSocketsServerService: VlcBackWebSocketsServerService,
    private readonly remotePlayerWebSocketsServerService: RemotePlayerWebSocketsServerService,
  ) {
  }

  onModuleInit() {
    const { httpAdapter } = this.adapterHost;
    const httpServer: Server = httpAdapter.getHttpServer?.() || httpAdapter.getInstance?.();

    httpServer.on("listening", () => {
      this.logger.log("Listening server http!");
      this.vlcBackWebSocketsServerService.startSocket(httpServer);
      this.remotePlayerWebSocketsServerService.startSocket(httpServer);
    } );

    // Para streaming:
    // mediaServer.run();
  }
}

export function addGlobalConfigToApp(app: INestApplication) {
  Cleanup.register(app);

  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(helmet());
  app.enableShutdownHooks(); // Para que se llame onModuleDestroy de services
  app.useGlobalFilters(new GlobalExceptionFilter());
  setupEventEmitterDecorators(app);
  const { FRONTEND_URL } = process.env;

  assertIsDefined(FRONTEND_URL);
  const whitelist: string[] = [FRONTEND_URL];

  app.enableCors( {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean)=> void) => {
    // Permite requests sin origin (apps móviles, Postman, etc.)
      if (!origin)
        return callback(null, true);

      try {
        const originUrl = new URL(origin);
        // Desarrollo local
        const isLocal = originUrl.hostname === "localhost"
                     || originUrl.hostname.startsWith("192.168.")
                     || originUrl.hostname.startsWith("127.0.0.1");
        // Producción - lista blanca
        const isWhitelisted = whitelist.includes(origin);

        if (isLocal || isWhitelisted)
          callback(null, true);
        else
          callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      } catch {
        callback(new Error(`Invalid origin: ${origin}`), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  } );
}

@Injectable()
export class CustomZodValidationPipe extends ZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const result = super.transform(value, metadata);

      return result;
    } catch (error: unknown) {
      if (error instanceof ZodValidationException)
        resendZodErrorWith422(error, value);

      throw error;
    }
  }
}

export const globalValidationProviders = [
  // Requests validation
  {
    provide: APP_PIPE,
    useClass: CustomZodValidationPipe,
  },
  // Responses validation
  {
    provide: APP_INTERCEPTOR,
    useClass: ZodSerializerInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ZodSerializerSchemaInterceptor,
  },
];

export function resendZodErrorWith422(error: ZodValidationException, model: unknown) {
  const zodError = error.getZodError();

  throw CustomValidationError.fromZodError(zodError, model);
}
