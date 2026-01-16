import { Body, Controller } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { musicUserListEntitySchema, musicUserListSchema } from "$shared/models/musics/users-lists";
import { User } from "#core/auth/users/User.decorator";
import { UserPatchOne, UserPost } from "#utils/nestjs/rest";
import { MusicUsersListsRepository } from "./repository/repository";

class PatchBody extends createZodDto(musicUserListSchema.pick( {
  list: true,
} )) {}

class GetMyListBody extends createZodDto(z.object( {
  expand: z.boolean(),
} )) {}

@Controller("/")
export class MusicUsersListsController {
  constructor(
    private readonly repo: MusicUsersListsRepository,
  ) {}

  @UserPost("/my-lists", musicUserListEntitySchema)
  async getMyList(
    @User() user: UserPayload,
    @Body() body: GetMyListBody,
  ) {
    return await this.repo.getAllResourcesSorted(user.id, body);
  }

  @UserPatchOne("/", musicUserListEntitySchema)
  async patchList(
    @User() user: UserPayload,
    @Body() body: PatchBody,
  ) {
    return await this.repo.patchOneByUserIdAndGet(user.id, {
      entity: {
        list: body.list,
      },
    } );
  }
}
