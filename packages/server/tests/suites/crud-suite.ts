/* eslint-disable jest/no-export */
import { Application } from "express";
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

type TestConfig<R> = OmitGetRepo<Omit<PatchTestsProps<R>, "getExpressApp">>;

type TestsConfig<R> = {
  getAll?: TestConfig<jest.Mocked<R>>;
  getOne?: TestConfig<jest.Mocked<R>>;
  patchOne?: TestConfig<jest.Mocked<R>>;
  getManyCriteria?: TestConfig<jest.Mocked<R>>;
  deleteOne?: TestConfig<jest.Mocked<R>>;
};

type Props<R> = {
  name: string;
  appModule: Parameters<typeof createTestingAppModuleAndInit>;
  repositoryClass?: new (...args: any[])=> R;
  testsConfig: TestsConfig<R>;
};
export function crudTestsSuite<R>(props: Props<R>) {
  const { testsConfig: testConfig } = props;
  const title = props.name ?? "CrudController";

  describe(`${title}`, () => {
    let routerApp: Application;
    let repository: jest.Mocked<R> | undefined;
    let testingSetup: TestingSetup;

    beforeAll(async () => {
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
