/* eslint-disable import/prefer-default-export */
import Group from "./document";
import UserModel from "./model";

export async function findByName(name: string): Promise<Group | null> {
  const [user]: Group[] = await UserModel.find( {
    name,
  } );

  return user;
}
