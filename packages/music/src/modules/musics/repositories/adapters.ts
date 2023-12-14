/* eslint-disable import/prefer-default-export */
import { Music, assertIsMusic } from "#shared/models/musics";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Music {
  const model: Music = {
    hash: docOdm.hash,
    title: docOdm.title,
    url: docOdm.url,
    path: docOdm.path,
    weight: docOdm.weight,
    artist: docOdm.artist,
    tags: docOdm.tags,
    duration: docOdm.duration,
    disabled: docOdm.disabled,
    lastTimePlayed: docOdm.lastTimePlayed,
  };

  assertIsMusic(model);

  return model;
}