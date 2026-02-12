import { MailerService } from "@nestjs-modules/mailer";
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
