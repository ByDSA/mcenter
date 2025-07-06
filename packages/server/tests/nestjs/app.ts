import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ModuleMetadata } from "@nestjs/common";
import { Application } from "express";
import { addGlobalConfigToApp, globalValidationProviders } from "#main/init.service";

export type TestingSetup = {
  app: INestApplication;
  routerApp: Application;
  module: TestingModule;
};

export async function createTestingAppModule(
  metadata: ModuleMetadata,
  _options?: unknown,
): Promise<TestingSetup> {
  const module = await Test.createTestingModule( {
    ...metadata,
    providers: [
      ...globalValidationProviders,
      ...(metadata.providers ?? []),
    ],
  } ).compile();
  const app = module.createNestApplication();

  addGlobalConfigToApp(app);
  const routerApp = app.getHttpServer();

  return {
    routerApp,
    app,
    module,
  };
}

export async function createTestingAppModuleAndInit(
  metadata: ModuleMetadata,
  _options?: unknown,
): Promise<TestingSetup> {
  const ret = await createTestingAppModule(metadata, _options);

  await ret.app.init();

  return ret;
}
