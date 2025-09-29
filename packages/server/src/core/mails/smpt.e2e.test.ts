import { MailerModule, MailerService } from "@nestjs-modules/mailer";
import { Test } from "@nestjs/testing";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { MailsModule } from "./module";

describe("localValidationService", () => {
  let testingSetup: TestingSetup;
  let service: MailerService;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        MailsModule,
      ],
      controllers: [],
      providers: [],
    } );
    service = await testingSetup.module.resolve(MailerService);
  } );

  afterAll(async () => {
    await testingSetup.app.close();
  } );

  it("should be defined", () => {
    expect(service).toBeDefined();
  } );

  describe("smtp Connection", () => {
    it("should verify SMTP connection without sending email", async () => {
      // eslint-disable-next-line prefer-destructuring
      const transporter = service["transporter"];
      const isConnected = await transporter.verify();

      expect(isConnected).toBe(true);
    } );
  } );
} );

describe("localValidationService - with INVALID config", () => {
  let testingSetup: TestingSetup;
  let service: MailerService;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        MailsModule,
      ],
      controllers: [],
      providers: [],
    }, {
      beforeCompile: async (builder) => {
        const tmpModule = await Test.createTestingModule( {
          imports: [
            MailerModule.forRoot( {
              transport: {
                pool: true,
                host: "127.0.0.1", // Host inválido
                port: 465,
                secure: true,
                auth: {
                  user: "invalid@invalid.com",
                  pass: "invalid-password",
                },
              },
              defaults: {
                from: "Test <invalid@invalid.com>",
              },
            } ),
          ],
        } ).compile();
        const mailerService = tmpModule.get(MailerService);

        builder.overrideProvider(MailerService)
          .useValue(mailerService);
      },
    } );
    service = await testingSetup.module.resolve(MailerService);
  } );

  afterAll(async () => {
    await testingSetup.app.close();
  } );

  it("should be defined", () => {
    expect(service).toBeDefined();
  } );

  it("should replace config", () => {
    // eslint-disable-next-line prefer-destructuring
    const transporter = service["transporter"];

    expect((transporter as any).options?.host).toBe("127.0.0.1");
  } );

  it("should fail verify SMTP connection without sending email", async () => {
    // eslint-disable-next-line prefer-destructuring
    const transporter = service["transporter"];

    await expect(transporter.verify()).rejects.toThrow();
  }, 5000);
} );
