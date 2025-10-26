import { Resource } from "$shared/models/resources";

export type ResourceWithUserInfo = Resource & {
  userInfo: {
    lastTimePlayed: number;
  };
};
