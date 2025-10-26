import { Types } from "mongoose";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { RemotePlayerEntity } from "../player-services/models";

export const fixturesRemotePlayers = {
  valid: {
    id: new Types.ObjectId().toString(),
    hostName: "Host",
    ownerId: fixtureUsers.Admin.User.id,
    secretToken: "secret-token",
  } satisfies RemotePlayerEntity,
};
