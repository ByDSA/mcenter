import fs from "node:fs";
import path from "node:path";
import { PATH_ROUTES } from "$shared/routing";
import { Application } from "express";
import request from "supertest";
import { Controller, Get, HttpStatus, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";
import { testRoute } from "#tests/main/routing";
import { TestingSetup, createTestingAppModuleAndInit } from "#tests/nestjs/app";
import { GlobalErrorHandlerService } from "#main/global-error-handler";
import { LoggingModule } from "./module";
import { LOGS_FOLDER } from "./config";

testRoute(PATH_ROUTES.logs.path);

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

@Controller("test")
class TestController {
  @Get("unhandled")
  throwUnhandledError() {
    throw new Error("Test unhandled error for logging");
  }

  @Get("error-500")
  throwError500() {
    throw new InternalServerErrorException();
  }

  @Get("error-423")
  throwError423() {
    throw new UnprocessableEntityException();
  }

  @Get("ok-200")
  ok() {
    return "OK";
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

  function fetchLogs() {
    return request(routerApp).get("/");
  }

  afterEach(()=> {
    clearLogs();
  } );

  it("logs works", async () => {
    const res = await fetchLogs()
      .expect(HttpStatus.OK);

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
