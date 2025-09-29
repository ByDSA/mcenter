import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import dotenv from "dotenv";
import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import mongoose from "mongoose";
import { UserEntityWithRoles } from "$shared/models/auth";
import { loadFixtureMusicsInDisk, loadFixtureSimpsons } from "#core/db/tests/fixtures/sets";
import { loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { Database } from "#core/db";
import { ConfigOdm } from "#core/config";
import { UserPassOdm } from "#core/auth/strategies/local/user-pass/repository/odm";
import { User } from "#core/auth/users/models";
import { AppPayloadService } from "#core/auth/strategies/jwt";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { AuthGoogleService, GoogleUser } from "#core/auth/strategies/google/service";

@Controller()
export class DevController {
  constructor(
    private readonly db: Database,
    private readonly usersRepo: UsersRepository,
    private readonly appPayloadService: AppPayloadService,
    private readonly authGoogleService: AuthGoogleService,
  ) {
  }

  @Get()
  main() {
    return "Hello world!";
  }

  private async useTestDb() {
    const config = dotenv.config( {
      path: "./tests/.env",
    } );
    const { parsed } = config;

    assertIsDefined(parsed);
    const { MONGO_DB, MONGO_HOSTNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_USER } = parsed as any;

    assertIsDefined(MONGO_DB);
    assertIsDefined(MONGO_HOSTNAME);
    assertIsDefined(MONGO_PASSWORD);
    assertIsDefined(MONGO_PORT);
    assertIsDefined(MONGO_USER);

    await this.db.connect( {
      database: MONGO_DB,
      hostname: MONGO_HOSTNAME,
      password: MONGO_PASSWORD,
      port: MONGO_PORT,
      username: MONGO_USER,
    } );
  }

  @Get("/tests/db/use-test")
  async dbUseTest() {
    await this.db.disconnect();
    await this.useTestDb();
  }

  @Get("/tests/db/use-dev")
  async dbUseDev() {
    await this.db.disconnect();
    await this.db.connect();
  }

  @Get(PATH_ROUTES.tests.resetFixtures.path)
  async fixturesReset() {
    await this.db.disconnect();
    await this.useTestDb();

    await this.db.dropAll();
    await mongooseCreateAllIndexes();
    const config = await ConfigOdm.Model.create( {} );

    config.mails.disabled = true;
    await config.save();

    await loadFixtureAuthUsers();
    await loadFixtureMusicsInDisk();

    await loadFixtureSimpsons();
  }

  @Get(PATH_ROUTES.tests.verificationToken.get.path)
  async getVerificationToken(
  @Query("username") username: string,
  ) {
    if (!username)
      return;

    const userPass = await UserPassOdm.Model.findOne( {
      username,
    } );

    return userPass?.verificationToken;
  }

  @Post(PATH_ROUTES.tests.createOauthUser.path)
  async createOauthUser(
    @Body() body: {user: User},
  ) {
    const googleUser: GoogleUser = {
      accessToken: "",
      email: body.user.email,
      firstName: body.user.firstName ?? "FirstName",
      lastName: body.user.lastName ?? "LastName",
      picture: "",
    };

    return await this.authGoogleService.signUpOrGet(googleUser);
  }

  @Post(PATH_ROUTES.tests.loginOauthUser.path)
  async loginOauthUser(
    @Body() body: {email: string},
  ) {
    const user = await this.usersRepo.getOneByEmail(body.email, {
      expand: ["roles"],
    } );

    assertFoundClient(user);
    assertFoundServer(user.roles);
    this.appPayloadService.login(user as UserEntityWithRoles);

    return user;
  }
}

async function mongooseCreateAllIndexes() {
  // Lista de todos tus modelos
  const modelNames = Object.keys(mongoose.models);

  for (const modelName of modelNames) {
    const model = mongoose.models[modelName];

    try {
      await model.createIndexes();
      console.log(`✓ Indexes created for ${modelName}`);
    } catch (error) {
      console.error(
        `✗ Error creating indexes for ${modelName}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}
