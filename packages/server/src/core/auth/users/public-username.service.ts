import { Injectable } from "@nestjs/common";
import { fixSlug } from "#musics/crud/builder/fix-slug";
import { assertFoundClient } from "#utils/validation/found";
import { User } from "./models";
import { UsersRepository } from "./crud/repository";

type Props = {
  slug: string;
};

@Injectable()
export class UserPublicUsernameService {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) {

  }

  getUniqueFromRegisteringUser( { publicName }: Pick<User, "publicName">) {
    const baseSlug = fixSlug(publicName);

    assertFoundClient(baseSlug);
    const slug = this.getAvailable( {
      slug: baseSlug,
    } );

    return slug;
  }

  private async getAvailable( { slug: base }: Props): Promise<string> {
    let currentSlug = base;
    let available: boolean;
    let i = 1;

    while (true) {
      available = await this.usersRepo.isPublicUsernameAvailable(currentSlug);

      if (available)
        return currentSlug;

      i++;
      currentSlug = `${base}-${i}`;
    }
  }
}
