import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { INestApplication, ModuleMetadata, Type } from "@nestjs/common";
import { Application } from "express";
import { addGlobalConfigToApp, globalValidationProviders } from "#core/app/init.service";
import { Database } from "#core/db/database";
import { DatabaseModule } from "#core/db/module";
import { LoggingModule } from "#core/logging/module";
import { GlobalErrorHandlerModule } from "#core/error-handlers/global-error-handler";
import { TestRealDatabase, TestMemoryDatabase } from "#core/db/tests";
import { MeilisearchModule } from "#modules/search/module";

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
    ],
    providers: [
      ...globalValidationProviders,
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
