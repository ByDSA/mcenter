import { GET_MANY_CRITERIA_PATH } from "../../../routing/routes-utils";

const GET_MANY = GET_MANY_CRITERIA_PATH;
const STREAMS = "/api/streams";

export const streamsRoutes = {
  path: STREAMS,
  getMany: {
    path: `${STREAMS}/${GET_MANY}`,
  },
  fixer: {
    path: `${STREAMS}/fixer`,
  },
  picker: {
    showPicker: {
      path: `${STREAMS}/picker`,
      withParams: (streamKey: string) => `${STREAMS}/picker/${streamKey}`,
    },
    getEpisode: {
      path: `${STREAMS}/get-episode`,
      withParams: (streamKey: string) => `${STREAMS}/get-episode/${streamKey}`,
    },
  },
  pickRandom: {
    path: `${STREAMS}/random`,
    withParams: (streamKey: string) => `${STREAMS}/random/${streamKey}`,
  },
};
