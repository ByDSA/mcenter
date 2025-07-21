"use client";

/* eslint-disable @typescript-eslint/naming-convention */
import { CriteriaSortDir } from "$shared/utils/criteria";
import { StreamRestDtos } from "$shared/models/streams/dto/transport";

type Body = StreamRestDtos.GetManyByCriteria.Body;
const { CriteriaExpand } = StreamRestDtos.GetManyByCriteria;
const { CriteriaSort } = StreamRestDtos.GetManyByCriteria;
const body: Body = {
  expand: [CriteriaExpand.series],
  sort: {
    [CriteriaSort.lastTimePlayed]: CriteriaSortDir.DESC,
  },
};

// eslint-disable-next-line require-await
export const fetcher = async (url: string) => {
  const options = {
    method: "POST",
    body: JSON.stringify(body),
    cors: "no-cors",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return fetch(url, options).then(r => r.json());
};
