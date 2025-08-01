import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ModuleMetadata } from "@nestjs/common";
import { Application } from "express";
import { addGlobalConfigToApp, globalValidationProviders } from "#main/init.service";
import { TestRealDatabase, TestMemoryDatabase } from "#tests/main";
import { Database } from "#main/db/Database";
import { DatabaseModule } from "#main/db/module";
import { LoggingModule } from "#main/logging/module";
import { GlobalErrorHandlerModule } from "#main/global-error-handler";

export type TestingSetup = {
  app: INestApplication;
  routerApp: Application;
  module: TestingModule;
  db?: TestRealDatabase;
};
type Options = {
  db: {
    using: "default" | "memory" | "real";
  };
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
      ...(options?.db.using ? [DatabaseModule] : []),
    ],
    providers: [
      ...globalValidationProviders,
      ...(metadata.providers ?? []),
    ],
  } );

  switch (options?.db.using) {
    case "default":
    case "real":
      moduleBuilder.overrideProvider(Database).useClass(TestRealDatabase);
      break;
    case "memory":
      moduleBuilder.overrideProvider(Database).useClass(TestMemoryDatabase);
      break;
  }

  const module = await moduleBuilder.compile();
  const app = module.createNestApplication();

  addGlobalConfigToApp(app);
  const routerApp = app.getHttpServer();

  return {
    routerApp,
    app,
    module,
    db: options?.db.using ? app.get<TestRealDatabase>(Database) : undefined,
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
