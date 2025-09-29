/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { UsersRepository } from "../crud/repository";
import { CriteriaOne } from "../crud/repository/repository";
import { UserEntity, UserEntityWithRoles } from "../models";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";

const usersData = fixtureUsers.AllUsers;

export class MockUsersRepository extends createMockClass(UsersRepository) {
  constructor() {
    super();

    this.getOneByEmail.mockImplementation(
      async (email: string, criteria?: CriteriaOne): Promise<UserEntity | null> =>{
        const user = usersData.find(u => u.email === email) ?? null;

        if (user && criteria?.expand?.includes("roles"))
          return this.expandRoles(user);

        return user;
      },
    );

    this.getOneById.mockImplementation(
      async (id: UserEntity["id"], criteria?: CriteriaOne): Promise<UserEntity | null> =>{
        const user = usersData.find(u => u.id === id) ?? null;

        if (user && criteria?.expand?.includes("roles"))
          return this.expandRoles(user);

        return user;
      },
    );
  }

  async expandRoles(user: UserEntity): Promise<UserEntityWithRoles> {
    user.roles = fixtureUsers.All.find(a=>a.User.id === user.id)?.Roles ?? [];

    return user as UserEntityWithRoles;
  }
}
