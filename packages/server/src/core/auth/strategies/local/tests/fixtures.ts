import { Types } from "mongoose";
import { fixtureUsers } from "#core/auth/users/tests/fixtures";
import { hashPasswordSync } from "#core/auth/users/tests/utils";
import { UserPassEntity } from "../user-pass/userPass.entity";

const adminPass = "123456";
const normalPass = "123456";
const admin = {
  id: new Types.ObjectId().toString(),
  createdAt: new Date(),
  password: hashPasswordSync(adminPass),
  userId: fixtureUsers.Admin.User.id,
  username: "admin",
} satisfies UserPassEntity;
const normal = {
  id: new Types.ObjectId().toString(),
  createdAt: new Date(),
  password: hashPasswordSync("123456"),
  userId: fixtureUsers.Normal.User.id,
  username: "test",
} satisfies UserPassEntity;

export const fixtureAuthLocal = {
  All: [
    admin,
    normal,
  ],
  Admin: {
    userPass: admin,
    password: adminPass,
  },
  Normal: {
    userPass: normal,
    password: normalPass,
  },
};
