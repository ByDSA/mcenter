import { Controller, Get, Sse, UnauthorizedException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EMPTY, Observable, of, Subject } from "rxjs";
import { map, startWith, mergeMap } from "rxjs/operators";
import { disconnectionResponseSchema, FromRemotePlayerEvent, initialConnectionsResponseSchema, newConnectionResponseSchema, openClosedResponseSchema } from "$shared/models/player";
import { UserEntity, UserPayload } from "$shared/models/auth";
import { DomainEvent } from "#core/domain-event-emitter";
import { User } from "#core/auth/users/User.decorator";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { mapRemotePlayerToFront } from "./online-remote-players.service";
import { FromRemotePlayerEvents } from "./player-services/events";
import { RemotePlayersRepository } from "./player-services/repository";

interface MessageEvent {
  data: object | string;
}

interface RemotePlayerEventWithId {
  remotePlayerId: string;
  event: any;
}

@Authenticated()
@Controller("/remote-players")
export class RemotePlayersController {
  private connectionsSubject = new Subject<RemotePlayerEventWithId>();

  constructor(
    private readonly repo: RemotePlayersRepository,
  ) {}

  @OnEvent(FromRemotePlayerEvents.WILDCARD)
  handleFromRemotePlayerEvents(event: DomainEvent<any>) {
    if (event.type === FromRemotePlayerEvents.Connection.TYPE) {
      const data = newConnectionResponseSchema.parse(event.payload);

      this.connectionsSubject.next( {
        remotePlayerId: data.remotePlayer.id,
        event: {
          type: FromRemotePlayerEvent.CONNECTION,
          data,
        },
      } );
    } else if (event.type === FromRemotePlayerEvents.Disconnect.TYPE) {
      const data = disconnectionResponseSchema.parse(event.payload);

      this.connectionsSubject.next( {
        remotePlayerId: data.remotePlayerId,
        event: {
          type: FromRemotePlayerEvent.DISCONNECT,
          data,
        },
      } );
    } else if (event.type === FromRemotePlayerEvents.OpenClosed.TYPE) {
      const data = openClosedResponseSchema.parse(event.payload);

      this.connectionsSubject.next( {
        remotePlayerId: data.remotePlayerId,
        event: {
          type: FromRemotePlayerEvent.OPEN_CLOSED,
          data,
        },
      } );
    }
  }

  @Sse("stream")
  async streamConnections(
    @User() user: UserPayload | null,
  ): Promise<Observable<MessageEvent>> {
    if (!user)
      throw new UnauthorizedException();

    const visibleRemotePlayers = await this.getAllVisibleForUser(user);

    return this.connectionsSubject.asObservable().pipe(
      // Filtrar eventos según permisos del usuario
      mergeMap(( { remotePlayerId, event } ) => visibleRemotePlayers
        .some(r=>r.id === remotePlayerId)
        ? of(event)
        : EMPTY),
      // Empezar con el evento inicial
      startWith( {
        type: "initial",
        data: initialConnectionsResponseSchema.parse( {
          remotePlayers: visibleRemotePlayers,
        } ),
      } ),
      // Formatear para SSE
      map((event) => ( {
        data: event,
      } )),
    );
  }

  @Get("/")
  async getAllVisibleForUser(@User() user: UserEntity | null) {
    if (!user)
      throw new UnauthorizedException();

    const remotePlayers = await this.repo.getAllVisiblesForUser(user.id);

    return remotePlayers.map(mapRemotePlayerToFront);
  }
}
