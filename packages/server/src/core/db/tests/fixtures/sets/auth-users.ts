import { fixtureUsers } from "#core/auth/users/tests/fixtures";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { UserRoleOdm } from "#core/auth/users/roles/repository/odm";
import { UserRoleMapOdm } from "#core/auth/users/roles/user-role/repository/odm";
import { fixtureAuthLocal } from "#core/auth/strategies/local/tests/fixtures";
import { UserPassOdm } from "#core/auth/strategies/local/user-pass/repository/odm";

export const loadFixtureAuthUsers = async () => {
  const users = fixtureUsers.AllUsers.map(UserOdm.toFullDoc);

  await UserOdm.Model.insertMany(users);
  const roles = fixtureUsers.AllRoles.map(UserRoleOdm.toFullDoc);

  await UserRoleOdm.Model.insertMany(roles);

  const userRoleMap = [fixtureUsers.Admin, fixtureUsers.Normal].flatMap(a=>a.UserRoleMap);

  await UserRoleMapOdm.Model.insertMany(userRoleMap);
  const userPasses = fixtureAuthLocal.All;

  await UserPassOdm.Model.insertMany(userPasses);
};

export const deleteFixtureAuthUsers = async () => {
  await UserOdm.Model.deleteMany();

  await UserRoleOdm.Model.deleteMany();

  await UserRoleMapOdm.Model.deleteMany();

  await UserPassOdm.Model.deleteMany();
};
