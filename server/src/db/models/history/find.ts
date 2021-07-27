/* eslint-disable import/prefer-default-export */
import { findUserByName, User } from "../user";
import Interface from "./interface";

type Params = {username: string; name: string};
type Ret = { history: Interface|null, user: User|null };
export async function findByNameAndUsername(
  { username, name }: Params,
): Promise<Ret> {
  const user: User | null = await findUserByName(username);
  let history = null;

  if (user) {
    history = getByNameAndUser( {
      name,
      user,
    } );
  }

  return {
    history,
    user,
  };
}

type Params2 = {user: User; name: string};
export function getByNameAndUser(
  { user, name }: Params2,
): Interface | null {
  if (!user.histories)
    return null;

  const [history] = user.histories.filter((h) => h.name === name);

  return history;
}
