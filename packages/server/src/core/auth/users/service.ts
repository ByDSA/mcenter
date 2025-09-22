import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { UserRoleName } from "./roles/role";
import { User, UserEntityWithRoles } from "./dto/user.dto";
import { UserRolesRepository } from "./roles/repository";
import { UsersRepository } from "./crud/repository";
import { UserRoleMapRepository } from "./roles/user-role";

@Injectable()
export class UsersService {
  constructor(
      private readonly rolesRepo: UserRolesRepository,
      private readonly userRoleMapRepo: UserRoleMapRepository,
      private readonly usersRepo: UsersRepository,
  ) {
  }

  async signUp(userDto: User): Promise<UserEntityWithRoles> {
    const user = await this.usersRepo.createOneAndGet(userDto);
    const newRole = await this.rolesRepo.getOneByName(UserRoleName.DEFAULT);

    assertIsDefined(newRole);

    await this.userRoleMapRepo.createOneAndGet( {
      userId: user.id,
      roleId: newRole.id,
    } );

    user.roles = [newRole];

    return user as UserEntityWithRoles;
  }
}
