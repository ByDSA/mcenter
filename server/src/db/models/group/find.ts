/* eslint-disable import/prefer-default-export */
import Group from "./document";
import GroupModel from "./model";

export async function findByUrl(groupUrl: string): Promise<Group | null> {
  const [group]: Group[] = await GroupModel.find( {
    url: groupUrl,
  }, {
    _id: 0,
  } );

  return group;
}
