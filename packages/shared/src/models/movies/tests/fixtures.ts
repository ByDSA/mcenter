import { ObjectId } from "mongodb";
import { fixtureUsers } from "../../auth/tests/fixtures";
import { fixtureImageCovers } from "../../image-covers/tests";
import { MovieEntity } from "../movie";
import { MovieFileInfoEntity } from "../file-info";

const timestamps = {
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
};
const fileInfoTimestamps = {
  createdAt: new Date(),
  updatedAt: new Date(),
};
const sample1: MovieEntity = {
  id: new ObjectId().toString(),
  title: "Inception",
  slug: "inception",
  year: 2010,
  genre: ["Sci-Fi", "Action"],
  director: "Christopher Nolan",
  synopsis: "A thief who steals corporate the use of dream secrets through-sharing technology.",
  duration: 148,
  imageCoverId: fixtureImageCovers.Disk.Samples.NodeJs.id,
  uploaderUserId: fixtureUsers.Normal.User.id,
  ...timestamps,
};
const sample2: MovieEntity = {
  id: new ObjectId().toString(),
  title: "The Matrix",
  slug: "the-matrix",
  year: 1999,
  genre: ["Sci-Fi", "Action"],
  director: "The Wachowskis",
  synopsis: "A computer hacker learns about the true nature of his reality.",
  duration: 136,
  imageCoverId: fixtureImageCovers.Disk.Samples.NodeJs.id,
  uploaderUserId: fixtureUsers.Normal.User.id,
  ...timestamps,
};
const fileInfoInception: MovieFileInfoEntity = {
  id: new ObjectId().toString(),
  movieId: sample1.id,
  hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  path: "inception/inception.mkv",
  size: 8_500_000_000,
  timestamps: fileInfoTimestamps,
  mediaInfo: {
    duration: 8880, // 148 min en segundos
    resolution: {
      width: 1920,
      height: 1080,
    },
    fps: "23.976",
  },
};
const fileInfoTheMatrix: MovieFileInfoEntity = {
  id: new ObjectId().toString(),
  movieId: sample2.id,
  hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
  path: "the-matrix/the-matrix.mkv",
  size: 7_200_000_000,
  timestamps: fileInfoTimestamps,
  mediaInfo: {
    duration: 8160, // 136 min en segundos
    resolution: {
      width: 1920,
      height: 1080,
    },
    fps: "24",
  },
};

export const fixtureMovies = {
  List: [
    sample1,
    sample2,
  ],
  Samples: {
    Inception: sample1,
    TheMatrix: sample2,
  },
  FileInfos: {
    Samples: {
      Inception: fileInfoInception,
      TheMatrix: fileInfoTheMatrix,
    },
    List: [fileInfoInception, fileInfoTheMatrix],
  },
};
