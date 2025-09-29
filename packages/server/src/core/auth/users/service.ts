import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { UserRoleName } from "./models";
import { User, UserEntityWithRoles } from "./models";
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

  async signUp(userCreateDto: Omit<User, "roles">): Promise<UserEntityWithRoles> {
    // Se obtiene antes de crear el usuario por si falla, no secree el usuario
    const newRole = await this.rolesRepo.getOneByName(UserRoleName.DEFAULT);

    assertIsDefined(newRole);
    const user = await this.usersRepo.createOneAndGet(userCreateDto);

    await this.userRoleMapRepo.createOneAndGet( {
      userId: user.id,
      roleId: newRole.id,
    } );

    user.roles = [newRole];

    return user as UserEntityWithRoles;
  }
}
