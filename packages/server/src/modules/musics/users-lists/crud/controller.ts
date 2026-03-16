import { Body, Controller } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { MusicUserListsCrudDtos } from "$shared/models/musics/users-lists/dto/transport";
import { musicUserListEntitySchema } from "$shared/models/musics/users-lists";
import { User } from "#core/auth/users/User.decorator";
import { UserPost, UserPatchOne } from "#utils/nestjs/rest";
import { MusicUsersListsRepository } from "./repository/repository";

class PatchBody extends createZodDto(
  MusicUserListsCrudDtos.PatchMyList.bodySchema,
) {}

class GetMyListBody extends createZodDto(
  z.object( {
    expand: z.boolean(),
  } ),
) {}
class MoveListBody extends createZodDto(
  MusicUserListsCrudDtos.MoveOne.bodySchema,
) {}

@Controller("/")
export class MusicUsersListsController {
  constructor(private readonly repo: MusicUsersListsRepository) {}

  @UserPost("/my-lists", musicUserListEntitySchema)
  async getMyList(@User() user: UserPayload, @Body() body: GetMyListBody) {
    return await this.repo.getAllResourcesSorted(user.id, body);
  }

  @UserPatchOne(musicUserListEntitySchema, {
    url: "/",
  } )
  async patchList(@User() user: UserPayload, @Body() body: PatchBody) {
    return await this.repo.patchOneByUserIdAndGet(user.id, body);
  }

  @UserPatchOne(musicUserListEntitySchema, {
    url: "/move",
  } )
  async moveOneList(
    @Body() body: MoveListBody,
    @User() user: UserPayload,
  ) {
    return await this.repo.moveOneList( {
      ownerUserId: user.id,
      entryId: body.entryId,
      newIndex: body.newIndex,
    } );
  }
}
