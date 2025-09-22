import { CanCreateOneAndGet } from "#utils/layers/repository";
import { UserEntity } from "../../dto/user.dto";
import { UserRoleMapOdm } from "./repository/odm";
import { UserRoleMap, UserRoleMapEntity } from "./userRole.entity";

type Entity = UserRoleMapEntity;
type Model = UserRoleMap;

export class UserRoleMapRepository
implements CanCreateOneAndGet<Model, Entity> {
  async createOneAndGet(dto: Model): Promise<Entity> {
    const doc = UserRoleMapOdm.toDoc(dto);
    const gotDoc = await UserRoleMapOdm.Model.create(doc);

    return UserRoleMapOdm.toEntity(gotDoc);
  }

  async getAllByUserId(userId: UserEntity["id"]): Promise<UserRoleMap[]> {
    const docs = await UserRoleMapOdm.Model.find( {
      userId,
    } );

    return docs.map(UserRoleMapOdm.toEntity);
  }
}
