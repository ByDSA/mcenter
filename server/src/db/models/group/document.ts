/* eslint-disable semi */
import { Resource } from "../resource";

export type ResourceType = "Music" | "Video";

export type ContentGroup = {
  type: ResourceType;
  id: string;
  url: string;
}[];

export default interface Group extends Resource {
    name: string;
    content: ContentGroup;
}
