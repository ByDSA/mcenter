import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { UserRolesRepository } from "../repository/repository";
import { UserRoleMapEntity } from "../userRole.entity";

const SAMPLE_USER_ROLE_MAP = {
  id: new Types.ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  roleId: fixtureUsers.AllRoles[0].id,
} satisfies UserRoleMapEntity;

class UserRolesRepositoryMock extends createMockClass(UserRolesRepository) {
  constructor() {
    super();

    this.getOneById.mockResolvedValue(SAMPLE_USER_ROLE_MAP);

    this.patchOneByIdAndGet.mockResolvedValue( {
      ...SAMPLE_USER_ROLE_MAP,
      roleId: new Types.ObjectId().toString(),
    } );

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_USER_ROLE_MAP);

    this.getOneByName.mockResolvedValue(null);

    this.getAll.mockResolvedValue([
      SAMPLE_USER_ROLE_MAP,
      {
        id: new Types.ObjectId().toString(),
        userId: fixtureUsers.Admin.User.id,
        roleId: fixtureUsers.AllRoles[1].id,
      },
    ]);

    this.createOneAndGet.mockImplementation((entity) => Promise.resolve( {
      ...entity,
      id: new Types.ObjectId().toString(),
    } ));
  }
}

registerMockProviderInstance(UserRolesRepository, new UserRolesRepositoryMock());
