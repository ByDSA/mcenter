import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { INestApplication, Logger, ModuleMetadata, Type } from "@nestjs/common";
import { Application } from "express";
import { APP_GUARD, RouterModule } from "@nestjs/core";
import { isDebugging } from "$shared/utils/vscode";
import { AppPayload, UserPayload } from "$shared/models/auth";
import { createMockInstance } from "$sharedTests/jest/mocking";
import { addGlobalConfigToApp, globalAuthProviders, globalValidationProviders } from "#core/app/init.service";
import { Database } from "#core/db/database";
import { DatabaseModule } from "#core/db/module";
import { LoggingModule } from "#core/logging/module";
import { GlobalErrorHandlerModule } from "#core/error-handlers/global-error-handler";
import { TestRealDatabase, TestMemoryDatabase } from "#core/db/tests";
import { MeilisearchModule } from "#modules/search/module";
import { UsersModule } from "#core/auth/users/module";
import { AppPayloadService, AuthModule } from "#core/auth/strategies/jwt";
import { MockUserPassRepository } from "#core/auth/strategies/local/tests/repository";
import { UserPassesRepository } from "#core/auth/strategies/local/user-pass";
import { MockUsersRepository } from "#core/auth/users/tests/repository";
import { authRoutes } from "#core/routing";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { AuthGoogleModule } from "#core/auth/strategies/google";

export type TestingSetup = {
  options?: Options;
  app: INestApplication;
  routerApp: Application;
  module: TestingModule;
  db?: TestRealDatabase;
  getMock: <T>(clazz: Type<T>)=> jest.Mocked<T>;
  resolveMock: <T>(clazz: Type<T>)=> Promise<jest.Mocked<T>>;
  useMockedUser: (user: UserPayload | null)=> Promise<void>;
};
type Options = {
  db?: {
    using: "default" | "memory" | "real";
  };
  auth?: {
    repositories: "mock" | "normal";
    cookies?: "mock" | "normal";
  };
  beforeCompile?: (moduleBuilder: TestingModuleBuilder)=> void;
};
export async function createTestingAppModule(
  metadata: ModuleMetadata,
  options?: Options,
): Promise<TestingSetup> {
  const mockAuthGuard = {
    canActivate: jest.fn(),
  };
  const moduleBuilder = Test.createTestingModule( {
    ...metadata,
    imports: [
      LoggingModule.forRoot(),
      GlobalErrorHandlerModule,
      ...(metadata.imports ?? []),
      ...(options?.db?.using ? [DatabaseModule, MeilisearchModule] : []),
      ...(options?.auth?.repositories
        ? [
          UsersModule,
          AuthModule,
          AuthGoogleModule,
          RouterModule.register(authRoutes),
        ]
        : []),
    ],
    providers: [
      ...globalValidationProviders,
      ...(options?.auth && options.auth.cookies !== "mock"
        ? globalAuthProviders
        : []),
      ...(options?.auth?.cookies === "mock"
        ? [{
          provide: APP_GUARD,
          useValue: mockAuthGuard,
        }]
        : []),
      ...(metadata.providers ?? []),
    ],
  } );

  switch (options?.db?.using) {
    case "default":
    case "real":
      moduleBuilder.overrideProvider(Database).useClass(TestRealDatabase);
      break;
    case "memory":
      moduleBuilder.overrideProvider(Database).useClass(TestMemoryDatabase);
      break;
  }

  if (options?.auth?.repositories === "mock") {
    moduleBuilder
      .overrideProvider(UsersRepository)
      .useClass(MockUsersRepository);
    moduleBuilder
      .overrideProvider(UserPassesRepository)
      .useClass(MockUserPassRepository);
  }

  if (options?.auth?.cookies === "mock") {
    const mockAppPayloadService = createMockInstance(AppPayloadService);

    mockAppPayloadService.getCookieUser.mockImplementation(
      ()=>null,
    );

    moduleBuilder
      .overrideProvider(AppPayloadService)
      .useValue(mockAppPayloadService);

    mockAuthGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();

      req.auth = {
        user: null,
      } as AppPayload;

      req.user = null;

      return true;
    } );
  }

  options?.beforeCompile?.(moduleBuilder);

  if (!isDebugging())
    Logger.overrideLogger([]);

  const module = await moduleBuilder.compile();

  module.useLogger(false);
  const app = module.createNestApplication();

  addGlobalConfigToApp(app);
  const routerApp = app.getHttpServer();
  const resolveMock = async <T>(clazz: Type<T>) => {
    return await module.resolve<jest.Mocked<T>>(clazz);
  };

  return {
    routerApp,
    options,
    app,
    module,
    db: options?.db?.using ? app.get<TestRealDatabase>(Database) : undefined,
    getMock: <T>(clazz: Type<T>) => {
      return module.get<jest.Mocked<T>>(clazz);
    },
    resolveMock,
    useMockedUser: async (user: UserPayload | null) => {
      if (options?.auth?.cookies !== "mock")
        return;

      const mockAppPayloadService = (await resolveMock(AppPayloadService));

      mockAppPayloadService.getCookieUser.mockImplementation(
        ()=>user,
      );

      if (user)
        mockAppPayloadService.refreshUser.mockImplementation(async ()=>await user);

      mockAuthGuard.canActivate.mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();

        req.auth = {
          user,
        } as AppPayload;

        req.user = user;

        return true;
      } );
    },
  };
}

export const createTestingAppModuleAndInit: typeof createTestingAppModule = async (
  metadata: ModuleMetadata,
  options?: Options,
) => {
  const ret = await createTestingAppModule(metadata, options);

  await ret.app.init();

  return ret;
};
