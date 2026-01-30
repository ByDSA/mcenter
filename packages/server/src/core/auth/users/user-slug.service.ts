import { Injectable } from "@nestjs/common";
import { fixSlug } from "#musics/crud/builder/fix-slug";
import { assertFoundClient } from "#utils/validation/found";
import { getUniqueString } from "#modules/resources/get-unique-string";
import { User } from "./models";
import { UsersRepository } from "./crud/repository";

@Injectable()
export class UserSlugService {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) {

  }

  async getUniqueFromRegisteringUser( { publicName }: Pick<User, "publicName">) {
    const baseSlug = fixSlug(publicName);

    assertFoundClient(baseSlug);
    const slug = await getUniqueString(
      baseSlug,
      (candidate) => this.usersRepo.isPublicUsernameAvailable(candidate),
    );

    return slug;
  }
}
