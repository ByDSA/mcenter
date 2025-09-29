import { Types } from "mongoose";
import { UserPassEntity } from "../../../../../server/src/core/auth/strategies/local/user-pass/userPass.entity";
import { hashPasswordSync } from "./utils";
import { fixtureUsers } from "./fixtures";

const adminPass = "123456";
const normalPass = "123456";
const admin = {
  id: new Types.ObjectId().toString(),
  createdAt: new Date(),
  passwordHash: hashPasswordSync(adminPass),
  userId: fixtureUsers.Admin.User.id,
  username: "admin",
} satisfies UserPassEntity;
const normal = {
  id: new Types.ObjectId().toString(),
  createdAt: new Date(),
  passwordHash: hashPasswordSync("123456"),
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
