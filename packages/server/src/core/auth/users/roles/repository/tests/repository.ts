/* eslint-disable require-await */
import { Injectable } from "@nestjs/common";
import { createMockClass } from "$sharedTests/jest/mocking";
import { fixtureUsers } from "#core/auth/users/tests/fixtures";
import { UserRolesRepository } from "../../repository";
import { UserRoleName } from "../../role";

@Injectable()
export class MockUserRolesRepository extends createMockClass(UserRolesRepository) {
  constructor() {
    super();
    this.getOneById.mockImplementation(async (roleId: string) => {
      return fixtureUsers.AllRoles.find(r => r.id === roleId) ?? null;
    } );

    this.getOneByName.mockImplementation(async (name: UserRoleName) => {
      return fixtureUsers.AllRoles.find(r => r.name === name) ?? null;
    } );

    this.getAll.mockImplementation(async () => {
      return fixtureUsers.AllRoles;
    } );
  }
}
