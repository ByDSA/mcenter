import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { UserEntity, User } from "$shared/models/auth";
import { OnEvent } from "@nestjs/event-emitter";
import { assertFoundClient } from "#utils/validation/found";
import { MusicPlaylistsRepository } from "#musics/playlists/crud/repository";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { UserEvents } from "#core/auth/users/crud/repository/events";
import { MusicPlayListEvents } from "../playlists/crud/repository/events";

type Entity = UserEntity;
type Model = User;
export type CriteriaOne = {
  expand?: ("roles")[];
  filter?: Partial<Record<keyof Model, any>>;
};

@Injectable()
export class UsersMusicPlaylistsRepository {
  constructor(
    private readonly playlistRepo: MusicPlaylistsRepository,
  ) { }

  @OnEvent(UserEvents.Created.TYPE)
  async handleUserEvents(ev: UserEvents.Created.Event) {
    const userId = ev.payload.entity.id;
    const newPlaylist = await this.playlistRepo.createOneAndGet( {
      name: "Favorites",
      slug: "favorites",
    }, userId);

    await this.setMusicPlaylistFavorite(userId, newPlaylist.id);
  }

  @OnEvent(MusicPlayListEvents.Deleted.TYPE)
  async handleDeletePlaylistEvents(ev: MusicPlayListEvents.Deleted.Event) {
    const playlistId = ev.payload.entity.id;

    await UserOdm.Model.updateMany(
      {
        "musics.favoritesPlaylistId": new Types.ObjectId(playlistId),
      },
      {
        $set: {
          "musics.favoritesPlaylistId": null,
        },
      },
    );
  }

  async setMusicPlaylistFavorite(
    userId: string,
    playlistId: string | null,
  ): Promise<Entity> {
    if (playlistId !== null) {
      await this.playlistRepo.guardOwnerPlaylist( {
        playlistId,
        userId,
      } );
    }

    const got = await UserOdm.Model.findByIdAndUpdate(userId, {
      $set: {
        "musics.favoritesPlaylistId": playlistId
          ? new Types.ObjectId(playlistId)
          : null,
      },
    }, {
      new: true,
    } );

    assertFoundClient(got);

    return UserOdm.toEntity(got);
  }
}
