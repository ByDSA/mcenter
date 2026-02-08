/* eslint-disable @typescript-eslint/naming-convention */
import { ObjectId } from "mongodb";
import { deepFreeze } from "../../../utils/objects";
import { fixtureUsers } from "../../../models/auth/tests/fixtures";
import { ImageCoverEntity } from "../imageCover";

const NodeJs: ImageCoverEntity = {
  id: new ObjectId().toString(),
  versions: {
    original: "sample-nodejs.png",
  },
  metadata: {
    label: "NodeJS",
  },
  uploaderUserId: fixtureUsers.Normal.User.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const SAMPLES_IN_DISK: ImageCoverEntity[] = deepFreeze([
  NodeJs,
]);

export const fixtureImageCovers = {
  Disk: {
    Samples: {
      NodeJs,
    },
    List: SAMPLES_IN_DISK,
  },
};
