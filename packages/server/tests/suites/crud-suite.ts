/* eslint-disable jest/no-export */
import { Application } from "express";
import { Logger } from "@nestjs/common";
import { getOneTests } from "#tests/suites/get-one";
import { patchOneTests, PatchTestsProps } from "#tests/suites/patch-one";
import { getManyCriteriaTests } from "#tests/suites/get-many-criteria";
import { getAllTests } from "#tests/suites/get-all";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { deleteOneTests } from "./delete-one";

type OmitGetRepo<T> = T extends { repo: infer R }
  ? Omit<T, "repo"> & {
      repo: Omit<R, "getRepo">;
    }
  : T;

type TestConfig<R> = OmitGetRepo<Omit<PatchTestsProps<R>, "getExpressApp" | "getTestingSetup">>;

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
    new Logger(crudTestsSuite.name).warn(`Skipping tests suite ${title}`);

    // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect, no-empty-function
    it.skip("skipped", () => {

    } );

    return;
  }

  describe(`${title}`, () => {
    let routerApp: Application;
    let repository: jest.Mocked<R> | undefined;
    let testingSetup: TestingSetup;

    beforeAll(async () => {
      if (props.appModule[1]?.auth) {
        props.appModule[1].auth.cookies ??= "mock";
        props.appModule[1].auth.repositories ??= "mock";
      }

      testingSetup = await createTestingAppModuleAndInit(...props.appModule);
      routerApp = testingSetup.routerApp;

      if (props.repositoryClass) {
        repository = testingSetup.module
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
        expect(repository).toBeDefined();
      } );
    }

    if (testConfig.getAll) {
      getAllTests( {
        getTestingSetup: ()=>testingSetup,
        ...testConfig.getAll,
        repo: {
          ...testConfig.getAll.repo,
          getRepo: () => repository!,
        },
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.getOne) {
      getOneTests( {
        getTestingSetup: ()=>testingSetup,
        ...testConfig.getOne,
        repo: {
          ...testConfig.getOne.repo,
          getRepo: () => repository!,
        },
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.patchOne) {
      patchOneTests( {
        getTestingSetup: ()=>testingSetup,
        ...testConfig.patchOne,
        repo: {
          ...testConfig.patchOne.repo,
          getRepo: () => repository!,
        },
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.getManyCriteria) {
      getManyCriteriaTests( {
        getTestingSetup: ()=>testingSetup,
        ...testConfig.getManyCriteria,
        repo: {
          ...testConfig.getManyCriteria.repo,
          getRepo: () => repository!,
        },
        getExpressApp: () => routerApp,
      } );
    }

    if (testConfig.deleteOne) {
      deleteOneTests( {
        getTestingSetup: ()=> testingSetup,
        ...testConfig.deleteOne,
        repo: {
          ...testConfig.deleteOne.repo,
          getRepo: () => repository!,
        },
        getExpressApp: () => routerApp,
      } );
    }
  } );
}
