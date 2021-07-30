import App from "@app/app";
import { ResourceInterface } from "../../db/models/resources/resource/interface";

/* eslint-disable import/prefer-default-export */
export function getFullUrl(resource: ResourceInterface, middleUrl: string, app: App) {
  return `${app.baseUrl}${middleUrl}/${resource.url}`;
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
