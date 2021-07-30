import { findUserByName, getSerieInUserByUrl } from "@models/user";

export type Params = {
  userName: string,
  serieUrl: string
};

export default async function get( { userName, serieUrl }: Params) {
  const user = await findUserByName(userName);

  if (!user)
    return null;

  const serieGroup = getSerieInUserByUrl( {
    user,
    url: serieUrl,
  } );

  if (!serieGroup)
    return null;

  return serieGroup;
}
