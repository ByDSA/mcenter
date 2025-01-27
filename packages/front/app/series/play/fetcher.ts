"use client";

import { StreamCriteriaExpand, StreamCriteriaSort, StreamGetManyRequest } from "#shared/models/streams";
import { CriteriaSortDir } from "#shared/utils/criteria";

const bodyJson: StreamGetManyRequest["body"] = {
  expand: [StreamCriteriaExpand.series],
  sort: {
    [StreamCriteriaSort.lastTimePlayed]: CriteriaSortDir.DESC,
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
