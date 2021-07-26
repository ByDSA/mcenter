/* eslint-disable import/prefer-default-export */
import Doc from "./document";
import UserModel from "./model";

export async function findByName(name: string): Promise<Doc | null> {
  const [user]: Doc[] = await UserModel.find( {
    name,
  } );

  return user;
}
