"use client";

import { CriteriaExpand, CriteriaSort, getManyBySearch } from "#shared/models/streams/dto";
import { CriteriaSortDir } from "#shared/utils/criteria";
import { z } from "zod";

type StreamGetManyRequest = {
  body: z.infer<typeof getManyBySearch.reqBodySchema>;
};

const bodyJson: StreamGetManyRequest["body"] = {
  expand: [CriteriaExpand.series],
  sort: {
    [CriteriaSort.lastTimePlayed]: CriteriaSortDir.DESC,
  },
};

// eslint-disable-next-line require-await
export const fetcher = async (url: string) => {
  const options = {
    method: "POST",
    body: JSON.stringify(bodyJson),
    cors: "no-cors",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return fetch(url, options).then(r => r.json());
};
