import { findUserByName, getGroupInUserByUrl } from "@models/user";

type Params = {username: string, group: string};
export default async function getGroup( { username, group }: Params) {
  const user = await findUserByName(username);

  if (!user)
    return null;

  const retGroup = getGroupInUserByUrl( {
    user,
    url: group,
  } );

  if (!retGroup)
    return null;

  return retGroup;
}
