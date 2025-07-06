import { Server } from "node:http";
import { container } from "tsyringe";
import { HttpAdapterHost } from "@nestjs/core";
import { ArgumentMetadata, INestApplication, Injectable, OnModuleInit, PipeTransform, UnprocessableEntityException } from "@nestjs/common";
import { assertIsDefined } from "#shared/utils/validation";
import helmet from "helmet";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationException, ZodValidationPipe } from "nestjs-zod";
import { GlobalExceptionFilter } from "#utils/express/errorHandler";
import { RemotePlayerWebSocketsServerService, VlcBackWebSocketsServerService } from "#modules/play";
import { ZodSerializerSchemaInterceptor } from "#utils/validation/zod-nestjs";
import { ExpressApp, RealMongoDatabase } from "./index";

@Injectable()
export class InitService implements OnModuleInit {
  private legacyApp!: ExpressApp;

  constructor(private readonly adapterHost: HttpAdapterHost) {
  }

  async onModuleInit() {
    console.log("Init service (before listen)");

    this.legacyApp = new ExpressApp( {
      db: {
        instance: new RealMongoDatabase(),
      },
      controllers: {
        cors: true,
      },
    } );
    const vlcBackWebSocketsServerService = container.resolve(VlcBackWebSocketsServerService);
    const remotePlayerWebSocketsServerService = container
      .resolve(RemotePlayerWebSocketsServerService);

    this.legacyApp.onHttpServerListen((server) => {
      vlcBackWebSocketsServerService.startSocket(server);
      remotePlayerWebSocketsServerService.startSocket(server);
    } );

    container.registerInstance(ExpressApp, this.legacyApp);

    const { httpAdapter } = this.adapterHost;

    await this.legacyApp.init(httpAdapter.getInstance());
    const httpServer: Server = httpAdapter.getHttpServer?.() || httpAdapter.getInstance?.();

    httpServer.on("listening", async () => {
      console.log("Listening!");
      await this.legacyApp.listen(httpServer);
    } );
  }
}

export function addGlobalConfigToApp(app: INestApplication) {
  app.use(helmet());
  app.useGlobalFilters(new GlobalExceptionFilter());
  const { FRONTEND_URL } = process.env;

  assertIsDefined(FRONTEND_URL);
  const whitelist: string[] = [FRONTEND_URL];

  app.enableCors( {
    preflightContinue: true,
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean)=> void) => {
      const allowsAnyOrigin = true;
      const originUrl = origin ? new URL(origin) : null;
      const originIsLocal = originUrl && (
        originUrl.hostname === "localhost"
        || originUrl.hostname.startsWith("192.168.")
      );
      const allows = (
        origin && (whitelist.includes(origin) || originIsLocal)
      ) || allowsAnyOrigin;

      if (allows)
        callback(null, true);
      else
        callback(new Error("Not allowed by CORS"), false);
    },
  } );
}

@Injectable()
export class CustomZodValidationPipe extends ZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const result = super.transform(value, metadata);

      return result;
    } catch (error: unknown) {
      if (error instanceof ZodValidationException) {
        const zodError = error.getZodError();

        throw new UnprocessableEntityException( {
          message: "Validation failed",
          errors: zodError?.issues ?? [],
          statusCode: 422,
        } );
      }

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
