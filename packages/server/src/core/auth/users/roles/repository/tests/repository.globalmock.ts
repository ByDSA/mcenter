import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { UserRoleEntity, UserRoleName } from "$shared/models/auth/role";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { UserRolesRepository } from "../repository";

const SAMPLE_USER_ROLE = {
  id: new Types.ObjectId().toString(),
  name: UserRoleName.USER,
} satisfies UserRoleEntity;

class UserRolesRepositoryMock extends createMockClass(UserRolesRepository) {
  constructor() {
    super();

    this.getOneById.mockResolvedValue(SAMPLE_USER_ROLE);

    this.patchOneByIdAndGet.mockResolvedValue( {
      ...SAMPLE_USER_ROLE,
      name: UserRoleName.ADMIN,
    } );

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_USER_ROLE);

    this.getOneByName.mockResolvedValue(SAMPLE_USER_ROLE);

    this.getAll.mockResolvedValue([
      SAMPLE_USER_ROLE,
      {
        id: new Types.ObjectId().toString(),
        name: UserRoleName.ADMIN,
      },
      {
        id: new Types.ObjectId().toString(),
        name: UserRoleName.GUEST,
      },
    ]);

    this.createOneAndGet.mockImplementation((entity) => Promise.resolve( {
      ...entity,
      id: new Types.ObjectId().toString(),
    } ));
  }
}

registerMockProviderInstance(UserRolesRepository, new UserRolesRepositoryMock());
