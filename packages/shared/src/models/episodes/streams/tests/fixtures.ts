import type { StreamEntity } from "../stream";
import { ObjectId } from "mongodb";
import { fixtureUsers } from "../../../auth/tests/fixtures";
import { StreamMode, StreamOriginType } from "../stream";
import { deepFreeze } from "../../../../utils/objects";

export const STREAM_SIMPSONS: StreamEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "simpsons",
  userId: fixtureUsers.Normal.User.id,
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: "simpsons",
      },
    ],
  },
  mode: StreamMode.RANDOM,
} satisfies StreamEntity);
