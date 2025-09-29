import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { ReactRenderService } from "../render.service";
import { TestTemplate } from "./TestTemplate";

describe("auth controller", () => {
  let testingSetup: TestingSetup;
  let service: ReactRenderService;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [],
      providers: [ReactRenderService],
    } );

    service = testingSetup.module.get<ReactRenderService>(ReactRenderService);
  } );

  it("should render", () => {
    const expectedContent = "ASDF";
    const actual = service.render( {
      template: {
        component: TestTemplate,
        ctx: {
          var1: expectedContent,
        },
      },
    } );

    expect(actual).toBeDefined();
    expect(actual).toContain(expectedContent);
  } );
} );
