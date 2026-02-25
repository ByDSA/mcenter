import { fixtureMovies } from "$shared/models/movies/tests/fixtures";
import { MovieOdm } from "#modules/movies/crud/repositories/movie";
import { MovieFileInfoOdm } from "#movies/file-info/crud/repository/odm";

export const loadFixtureSampleMovies = async () => {
  const docs: MovieOdm.FullDoc[] = fixtureMovies.List.map(MovieOdm.toFullDoc);

  await MovieOdm.Model.insertMany(docs);
};

export const deleteFixtureSampleMovies = async () => {
  await MovieOdm.Model.deleteMany();
};

export const loadFixtureSampleMovieFileInfos = async () => {
  const docs = fixtureMovies.FileInfos.List.map(fi => MovieFileInfoOdm.toFullDoc(fi));

  await MovieFileInfoOdm.Model.insertMany(docs);
};
