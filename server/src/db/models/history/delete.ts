import { findUserByName } from "../user";

// eslint-disable-next-line import/prefer-default-export
export async function deleteAllInUser(username: string) {
  const user = await findUserByName(username);

  if (!user)
    return null;

  user.histories = [];

  user.save();

  return user;
}
