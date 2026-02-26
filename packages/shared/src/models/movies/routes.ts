import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "../../routing/routes-utils";

const MOVIES = "/api/movies";
const MOVIES_FILE_INFO = `${MOVIES}/file-info`;
const GET_ONE = GET_ONE_CRITERIA_PATH;
const GET_MANY = GET_MANY_CRITERIA_PATH;

export const moviesRoutes = {
  path: MOVIES,
  withParams: (id: string) => `${MOVIES}/${id}`,
  getMany: {
    path: `${MOVIES}/${GET_MANY}`,
  },
  getOne: {
    path: `${MOVIES}/${GET_ONE}`,
  },
  fileInfo: {
    path: MOVIES_FILE_INFO,
    withParams: (id: string) => `${MOVIES_FILE_INFO}/${id}`,
    upload: {
      path: `${MOVIES_FILE_INFO}/upload`,
    },
  },
};
