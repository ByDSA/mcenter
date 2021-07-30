/* eslint-disable import/prefer-default-export */
import { Schema } from "mongoose";
import Doc from "./document";
import Interface from "./interface";
import UserModel from "./model";

export async function findByName(name: string): Promise<Doc | null> {
  const [user]: Doc[] = await UserModel.find( {
    name,
  } );

  return user;
}

type Params = {id: Schema.Types.ObjectId, user: Interface};
export function getGroupById( { id, user }: Params) {
  const { groups } = user;

  if (!groups)
    return null;

  return groups.find((g) => g._id === id) ?? null;
}

type Params2 = {name: string, user: Interface};
export function getGroupByName( { name, user }: Params2) {
  const { groups } = user;

  if (!groups)
    return null;

  return groups.find((g) => g.name === name) ?? null;
}

type Params3 = {url: string, user: Interface};
export function getGroupByUrl( { url, user }: Params3) {
  const { groups } = user;

  if (!groups)
    return null;

  return groups.find((g) => g.url === url) ?? null;
}
