import { ResourceInterface } from "../../db/models/resource/interface";
import { HOST, PORT } from "../routes.config";

/* eslint-disable import/prefer-default-export */
export function getFullUrl(resource: ResourceInterface, middleUrl: string) {
  const SERVER = `http://${HOST}:${PORT}`;

  return `${SERVER}/${middleUrl}/${resource.url}`;
}

type Params<R extends ResourceInterface> = {
  resource: R;
  nextUrl: string;
  fullUrlFunc: (resource: R)=> string
};
export function generateLinkedPlaylist<R extends ResourceInterface>(
  { resource, nextUrl, fullUrlFunc }: Params<R>,
): string {
  const ret = `#EXTM3U
  #EXTINF:317,${resource.name}
  ${fullUrlFunc(resource)}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}
