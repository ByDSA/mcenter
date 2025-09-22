import { REQUEST } from "@nestjs/core";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { MockUsersRepository } from "#core/auth/users/tests/repository";
import { UserRoleMapRepository } from "#core/auth/users/roles/user-role";
import { MockUserRoleMapRepository } from "#core/auth/users/roles/user-role/tests/repository";
import { UsersModule } from "#core/auth/users";
import { createMockedModule } from "#utils/nestjs/tests";
import { UserRolesRepository } from "#core/auth/users/roles/repository";
import { MockUserRolesRepository } from "#core/auth/users/roles/repository/tests/repository";
import { AuthLocalService } from "../service";
import { UserPassesRepository } from "../user-pass";
import { MockUserPassRepository } from "./repository";

describe("localValidationService", () => {
  let testingSetup: TestingSetup;
  let service: AuthLocalService;

  beforeAll(async () => {
    const mockResponse = {
      cookie: jest.fn(),
    };
    const mockRequest = {
      cookies: {},
      query: {},
      res: mockResponse,
    };

    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(UsersModule),
      ],
      controllers: [],
      providers: [
        AuthLocalService,
        UserPassesRepository,
        {
          provide: REQUEST,
          useValue: mockRequest,
        }],
    }, {
      auth: {
        using: true,
      },
      beforeCompile: (builder) => {
        builder
          .overrideProvider(UserRolesRepository)
          .useClass(MockUserRolesRepository);
        builder
          .overrideProvider(UserRoleMapRepository)
          .useClass(MockUserRoleMapRepository);
        builder
          .overrideProvider(UserPassesRepository)
          .useClass(MockUserPassRepository);
        builder
          .overrideProvider(UsersRepository)
          .useClass(MockUsersRepository);

        builder
          .overrideProvider(REQUEST)
          .useValue(mockRequest);
      },
    } );
    service = await testingSetup.module.resolve(AuthLocalService);
  } );

  it("should be defined", () => {
    expect(service).toBeDefined();
  } );

  it("should not validate wrong login", async () => {
    const a = await service.login( {
      usernameOrEmail: "username",
      password: "password",
    } );

    expect(a).toBeFalsy();
  } );

  it("should validate right login", async () => {
    const a = await service.login( {
      usernameOrEmail: "test",
      password: "123456",
    } );

    expect(a).toBeTruthy();
  } );
} );
