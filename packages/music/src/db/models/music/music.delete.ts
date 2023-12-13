import MusicModel from "./music.model";

// eslint-disable-next-line import/prefer-default-export
export async function deleteAll() {
  await MusicModel.deleteMany();
}
