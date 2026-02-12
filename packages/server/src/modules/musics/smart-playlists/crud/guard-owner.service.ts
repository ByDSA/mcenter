import { ForbiddenException, Injectable } from "@nestjs/common";
import { assertFoundClient } from "#utils/validation/found";
import { MusicSmartPlaylistRepository } from "./repository/repository";

@Injectable()
export class GuardOwnerService {
  constructor(
    private readonly crudService: MusicSmartPlaylistRepository,
  ) { }

  async guardOwner(userId: string, smartPlaylistId: string): Promise<void> {
    const query = await this.crudService.getOneById(smartPlaylistId);

    assertFoundClient(query);

    if (query.ownerUserId !== userId)
      throw new ForbiddenException("User is not the owner of the query");
  }
}
