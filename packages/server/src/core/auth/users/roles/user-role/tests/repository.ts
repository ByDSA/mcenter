/* eslint-disable require-await */
import { Types } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { CanCreateOneAndGet } from "#utils/layers/repository";
import { UserRoleMapEntity, UserRoleMap } from "../userRole.entity";
import { UserEntity } from "../../../models";

type Entity = UserRoleMapEntity;
type Model = UserRoleMap;

export class MockUserRoleMapRepository
implements CanCreateOneAndGet<Model, Entity> {
  async createOneAndGet(dto: Model): Promise<Entity> {
    const newId = new Types.ObjectId().toString();
    const ret: Entity = {
      id: newId,
      ...dto,
    };
    const fixture = [fixtureUsers.Normal,
      fixtureUsers.Admin,
    ].find(u=>u.User.id === dto.userId);

    assertIsDefined(fixture);
    fixture.UserRoleMap.push(ret);

    return ret;
  }

  async getAllByUserId(userId: UserEntity["id"]): Promise<UserRoleMap[]> {
    const fixture = [fixtureUsers.Normal,
      fixtureUsers.Admin,
    ].find(u=>u.User.id === userId);

    return fixture?.UserRoleMap ?? [];
  }
}
