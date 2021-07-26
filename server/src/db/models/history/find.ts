/* eslint-disable import/prefer-default-export */
import { findUserByName, User } from "../user";
import Interface from "./interface";

type Params = {username: string; name: string};
type Ret = { history?: Interface, user?: User };
export async function findInUserByName(
  { username, name }: Params,
): Promise<Ret> {
  const user: User|null = await findUserByName(username);

  if (!user || !user.histories) {
    return {
    };
  }

  const [history] = user.histories.filter((h) => h.name === name);

  return {
    history,
    user,
  };
}
