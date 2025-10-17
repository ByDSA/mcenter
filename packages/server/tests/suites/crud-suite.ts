/* eslint-disable jest/no-export */
import { Application } from "express";
import { Logger } from "@nestjs/common";
import { getOneTests } from "#tests/suites/get-one";
import { BeforeExecutionConfig, patchOneTests, PatchTestsProps, TestGroupConfigCtx } from "#tests/suites/patch-one";
import { getManyCriteriaTests } from "#tests/suites/get-many-criteria";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { deleteOneTests } from "./delete-one";
import { MockConfig } from "./generate-http-case";

type ReplaceRepoConfig<T, R> = Omit<T, "buildDynamicConfig"> & {
  repoConfig: (ctx: BeforeExecutionConfig<R> & TestGroupConfigCtx)=> MockConfig<any>;
};

type CommonTestsKeys = "beforeExecution" | "getExpressApp" | "getTestingSetup";
type TestConfig<R> = ReplaceRepoConfig<Omit<PatchTestsProps<R>, CommonTestsKeys>, R>;

type TestsConfig<R> = {
  getAll?: TestConfig<jest.Mocked<R>>;
  getOne?: TestConfig<jest.Mocked<R>>;
  patchOne?: TestConfig<jest.Mocked<R>>;
  getManyCriteria?: TestConfig<jest.Mocked<R>>;
  deleteOne?: TestConfig<jest.Mocked<R>>;
};

type Props<R> = {
  name: string;
  skip?: boolean;
  appModule: Parameters<typeof createTestingAppModuleAndInit>;
  repositoryClass?: new (...args: any[])=> R;
  testsConfig: TestsConfig<R>;
};
export function crudTestsSuite<R>(props: Props<R>) {
  const { testsConfig: testConfig } = props;
  const title = props.name ?? "CrudController";

  if (props.skip) {
    new Logger(crudTestsSuite.name).warn(`Skipping test suite ${title}`);

    // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect, no-empty-function
    it.skip("skipped", () => {

    } );

    return;
  }

  describe(`${title}`, () => {
    let routerApp: Application;
    let repo: jest.Mocked<R> | undefined;
    let testingSetup: TestingSetup;

    beforeAll(async () => {
      if (props.appModule[1]?.auth) {
        props.appModule[1].auth.cookies ??= "mock";
        props.appModule[1].auth.repositories ??= "mock";
      }

      testingSetup = await createTestingAppModuleAndInit(...props.appModule);
      routerApp = testingSetup.routerApp;

      if (props.repositoryClass) {
        repo = testingSetup.module
          .get<jest.Mocked<R>>(props.repositoryClass);
      }
    } );

    beforeEach(() => {
      jest.clearAllMocks();
    } );

    it("expressApp should be defined", () => {
      expect(routerApp).toBeDefined();
    } );

    if (props.repositoryClass) {
      it("repository should be defined", () => {
        expect(repo).toBeDefined();
      } );
    }

    const beforeExecution = () => ( {
      repo: repo!,
    } );

    if (testConfig.getOne) {
      getOneTests( {
        getTestingSetup: () => testingSetup,
        ...testConfig.getOne,
        buildDynamicConfig: (ctx) => {
          return {
            mockConfig: testConfig.getOne!.repoConfig( {
              ...ctx,
              beforeExecution,
            } ),
          };
        },
        beforeExecution,
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.patchOne) {
      patchOneTests( {
        getTestingSetup: () => testingSetup,
        ...testConfig.patchOne,
        buildDynamicConfig: (ctx) => {
          return {
            mockConfig: testConfig.patchOne!.repoConfig( {
              ...ctx,
              beforeExecution,
            } ),
          };
        },
        beforeExecution,
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.getManyCriteria) {
      getManyCriteriaTests( {
        getTestingSetup: () => testingSetup,
        ...testConfig.getManyCriteria,
        buildDynamicConfig: (ctx) => {
          return {
            mockConfig: testConfig.getManyCriteria!.repoConfig( {
              ...ctx,
              beforeExecution,
            } ),
          };
        },
        beforeExecution,
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.deleteOne) {
      deleteOneTests( {
        getTestingSetup: () => testingSetup,
        ...testConfig.deleteOne,
        buildDynamicConfig: (ctx) => {
          return {
            mockConfig: testConfig.deleteOne!.repoConfig( {
              ...ctx,
              beforeExecution,
            } ),
          };
        },
        beforeExecution,
        getExpressApp: () => routerApp,
      } );
    }
  } );
}
