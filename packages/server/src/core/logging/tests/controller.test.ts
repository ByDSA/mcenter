import fs from "node:fs";
import path from "node:path";
import { Application } from "express";
import request from "supertest";
import { HttpStatus, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";
import { TestingSetup, createTestingAppModuleAndInit } from "#core/app/tests/app";
import { GlobalErrorHandlerService } from "#core/error-handlers/global-error-handler";
import { LOGS_FOLDER } from "../config";
import { LoggingModule } from "../module";
import { TestController } from "./Test.controller";

function clearLogs() {
  const logDir = LOGS_FOLDER;

  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir);

    files.forEach(file => {
      if (file.endsWith(".log"))
        fs.writeFileSync(path.join(logDir, file), "");
    } );
    // Nota: si se borra la carpeta o archivos, no funciona porque
    // no se vuelve a crear el archivo de log
  }
}

describe("test", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;

  beforeAll(async () => {
    clearLogs();
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [TestController],
      imports: [
        LoggingModule.forRoot( {
          silentFiles: false,
        } ),
      ],
    } );
    routerApp = testingSetup.routerApp;
  } );

  async function fetchLogs() {
    return await request(routerApp).get("/")
      .send();
  }

  afterEach(()=> {
    clearLogs();
  } );

  it("logs works", async () => {
    const res = await fetchLogs();

    expect(res.statusCode).toBe(HttpStatus.OK);

    const body = res.body as any[];

    expect(body.length).toBeGreaterThan(0);

    expect(res.text).toContain("Nest application successfully started");
  } );

  it("should log unhandled errors", async () => {
    await request(routerApp).get("/test/unhandled")
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    const res = await fetchLogs();

    expect(res.text).toContain("Test unhandled error for logging");
    expect(res.text).toContain("at TestController.throwUnhandledError");
  } );

  it("should log 500 errors as error", async () => {
    await request(routerApp).get("/test/error-500")
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    const res = await fetchLogs();

    expect(res.text).toContain(InternalServerErrorException.name);
    expect(res.text).toContain("at TestController.throwError500");
    expect(res.text).toMatch(/error(.*)Internal Server Error/);
  } );

  it("should not log 423 errors as error", async () => {
    await request(routerApp).get("/test/error-423")
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    const res = await fetchLogs();

    expect(res.text).not.toContain(UnprocessableEntityException.name);
    expect(res.text).not.toContain("at TestController"); // no stack
    expect(res.text).toMatch(/warn(.*)Unprocessable Entity/);
  } );

  it("should log accessing to ok-200", async () => {
    await request(routerApp).get("/test/ok-200")
      .expect(HttpStatus.OK);

    const res = await fetchLogs();

    expect(res.text).toContain("Incoming GET /test/ok-200");
    expect(res.text).toContain("Completed GET /test/ok-200 in ");
  } );

  it("global error handler", async () => {
    const service = testingSetup.app.get(GlobalErrorHandlerService);

    process.removeAllListeners("uncaughtException");

    const originalFn = service.onUncaughtException.bind(service);

    jest.spyOn(service, "onUncaughtException").mockImplementation((err: Error) => {
      try {
        originalFn(err);
      // eslint-disable-next-line no-empty
      } catch { }
    } );

    // Re-registra el listener, usando el método MOCKEADO
    (service as any).setupGlobalErrorHandlers();

    process.emit("uncaughtException", new Error("Test uncaught exception"));

    const res = await fetchLogs();

    expect(res.text).toContain("Test uncaught exception");
  } );
} );
