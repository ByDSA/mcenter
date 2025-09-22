import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { INestApplication, ModuleMetadata, Type } from "@nestjs/common";
import { Application } from "express";
import { RouterModule } from "@nestjs/core";
import { addGlobalConfigToApp, globalAuthProviders, globalValidationProviders } from "#core/app/init.service";
import { Database } from "#core/db/database";
import { DatabaseModule } from "#core/db/module";
import { LoggingModule } from "#core/logging/module";
import { GlobalErrorHandlerModule } from "#core/error-handlers/global-error-handler";
import { TestRealDatabase, TestMemoryDatabase } from "#core/db/tests";
import { MeilisearchModule } from "#modules/search/module";
import { UsersModule } from "#core/auth/users/module";
import { AuthModule } from "#core/auth/strategies/jwt";
import { MockUserPassRepository } from "#core/auth/strategies/local/tests/repository";
import { UserPassesRepository } from "#core/auth/strategies/local/user-pass";
import { MockUsersRepository } from "#core/auth/users/tests/repository";
import { authRoutes } from "#core/routing";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { AuthGoogleModule } from "#core/auth/strategies/google";

export type TestingSetup = {
  app: INestApplication;
  routerApp: Application;
  module: TestingModule;
  db?: TestRealDatabase;
  getMock: <T>(clazz: Type<T>)=> jest.Mocked<T>;
};
type Options = {
  db?: {
    using: "default" | "memory" | "real";
  };
  auth?: {
    using: boolean | "mock";
  };
  beforeCompile?: (moduleBuilder: TestingModuleBuilder)=> void;
};
export async function createTestingAppModule(
  metadata: ModuleMetadata,
  options?: Options,
): Promise<TestingSetup> {
  const moduleBuilder = Test.createTestingModule( {
    ...metadata,
    imports: [
      LoggingModule.forRoot(),
      GlobalErrorHandlerModule,
      ...(metadata.imports ?? []),
      ...(options?.db?.using ? [DatabaseModule, MeilisearchModule] : []),
      ...(options?.auth?.using
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
      ...(options?.auth?.using ? globalAuthProviders : []),
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

  if (options?.auth?.using === "mock") {
    moduleBuilder
      .overrideProvider(UsersRepository)
      .useClass(MockUsersRepository);
    moduleBuilder
      .overrideProvider(UserPassesRepository)
      .useClass(MockUserPassRepository);
  }

  options?.beforeCompile?.(moduleBuilder);

  const module = await moduleBuilder.compile();
  const app = module.createNestApplication();

  addGlobalConfigToApp(app);
  const routerApp = app.getHttpServer();

  return {
    routerApp,
    app,
    module,
    db: options?.db?.using ? app.get<TestRealDatabase>(Database) : undefined,
    getMock: <T>(clazz: Type<T>) => {
      return module.get<jest.Mocked<T>>(clazz);
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
