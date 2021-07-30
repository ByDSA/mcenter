import { findUserByName, getGroupInUserByUrl } from "@models/user";

export type Params = { userName: string, groupUrl: string };

export default async function get( { userName, groupUrl }: Params) {
  const user = await findUserByName(userName);

  if (!user)
    return null;

  const retGroup = getGroupInUserByUrl( {
    user,
    url: groupUrl,
  } );

  if (!retGroup)
    return null;

  return retGroup;
}
