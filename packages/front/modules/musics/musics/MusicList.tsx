import { Fragment, useEffect, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "../requests";
import { MusicEntryElement } from "./entry/MusicEntry";
import { ArrayData } from "./types";
import "#styles/resources/history-entry.css";
import "#styles/resources/history-musics.css";
import "#styles/resources/music.css";

type Props = {
  filters: {
    title?: string;
  };
};

type Data = ArrayData;

export function MusicList(props: Props) {
  const { data, isLoading, error,
    setItem, observerTarget, totalCount } = useMusicList(props);
  const resultNumbers = <span style={{
    display: "flex",
    justifyContent: "left",
    marginTop: "0.5rem",
    fontSize: "0.8em",
  }}>Resultados: {data?.length} de {totalCount}</span>;

  return renderFetchedData<Data | null>( {
    data,
    error,
    isLoading,
    render: () => (
      <>
        {resultNumbers}
        <br/>
        <span className="history-list">
          {
          data!.map(
            (music, i, array) => <Fragment key={`${music.id}`}>
              <MusicEntryElement value={music} setValue={(newData)=>setItem(i, newData)}/>
            </Fragment>,
          )
          }
          <div ref={observerTarget} style={{
            height: "1px",
          }} />
          {
            !!error
        && error instanceof Error
        && <span style={{
          marginTop: "2em",
        }}>{error.message}</span>
          }
        </span>
        {(data?.length ?? 0) > 10 && data?.length === totalCount && resultNumbers}
      </>
    ),
  } );
}

function useMusicList(props: Props) {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const api = FetchApi.get(MusicsApi);
  const criteriaCommon: MusicsApi.GetManyByCriteria.Criteria = {
    sort: {
      added: "desc",
    },
    filter: getFilterFromProps(props),
    expand: ["fileInfos"],
  };
  const { data, isLoading, error,
    setItem, observerTarget, fetchInitData } = useCrudDataWithScroll( {
    initialFetch: async () => {
      const result = await api.getManyByCriteria( {
        limit: 10,
        ...criteriaCommon,
      } );
      const gotTotalCount = result.metadata?.totalCount;

      if (gotTotalCount !== undefined)
        setTotalCount(gotTotalCount);

      return result.data as Data;
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await api.getManyByCriteria( {
          limit: 5,
          offset: d?.length ?? 0,
          ...criteriaCommon,
        } );
        const gotTotalCount = result.metadata?.totalCount;

        if (gotTotalCount !== undefined)
          setTotalCount(gotTotalCount);

        return result.data as Data;
      },
    },
  } );

  useEffect(() => {
    fetchInitData()
      .catch(showError);
  }, [props.filters]);

  return {
    data,
    isLoading,
    error,
    totalCount,
    setItem,
    observerTarget,
  };
}

function getFilterFromProps(
  props: Props,
): MusicsApi.GetManyByCriteria.Criteria["filter"] | undefined {
  const ret: MusicsApi.GetManyByCriteria.Criteria["filter"] = {};

  if (props.filters.title)
    ret.title = props.filters.title;

  if (Object.entries(ret).length === 0)
    return undefined;

  return ret;
}
