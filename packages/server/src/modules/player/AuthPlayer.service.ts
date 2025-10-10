import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { RemotePlayersRepository } from "./player-services/repository";

type GuardUserProps = {
  remotePlayerId: string;
  userId: string;
};
type GuardTokenProps = {
  remotePlayerId: string;
  secretToken: string;
};
@Injectable()
export class AuthPlayerService {
  private logger = new Logger(AuthPlayerService.name);

  constructor(
    private readonly repo: RemotePlayersRepository,
  ) {}

  async guardUser( { remotePlayerId, userId }: GuardUserProps) {
    const visible = await this.repo.canView( {
      remotePlayerId,
      userId,
    } );

    if (!visible)
      throw new ForbiddenException();
  }

  async guardToken( { remotePlayerId, secretToken }: GuardTokenProps) {
    const remotePlayer = await this.repo.getOneBySecretToken(secretToken);

    if (!remotePlayer || remotePlayer.id !== remotePlayerId) {
      this.logger.warn(
        `Error auth for remotePlayerId=${remotePlayerId}, secretToken=${secretToken}`,
      );

      throw new ForbiddenException();
    }
  }
}
