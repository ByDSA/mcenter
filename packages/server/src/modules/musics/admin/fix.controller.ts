import { Controller, Param } from "@nestjs/common";
import { musicSchema } from "$shared/models/musics/music";
import { GetOne } from "#utils/nestjs/rest";
import { MusicsRepository } from "../crud/repository";

const API = "/api";
const CREATE = `${API}/create`;
const ROUTE_CREATE_YT = `${CREATE}/yt`;

@Controller("/update/fix")
export class MusicFixController {
  constructor(
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  @GetOne(`${ROUTE_CREATE_YT}/:id`, musicSchema)
  get(@Param() params: any) {
    const { id: _ } = params;

    // TODO:
    // return this.musicRepo.findOrCreateOneFromYoutube(id);
  }
}
