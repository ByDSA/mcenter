import { Fragment, useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "../requests";
import { MusicEntityWithFileInfos } from "../models";
import { MusicEntryElement } from "./entry/MusicEntry";
import { ArrayData } from "./types";
import "#styles/resources/resource-list-entry.css";
import "#styles/resources/resource-list-musics.css";
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
        <span className="resource-list">
          {
          data!.map(
            (music, i) => <Fragment key={`${music.id}`}>
              <MusicEntryElement data={music} setData={
                (newData)=>setItem(i, newData as MusicEntityWithFileInfos)
              }
              shouldFetchFileInfo={true}
              />
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
  const limitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingMoreLimitRef = useRef<number>(5);
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
          limit: fetchingMoreLimitRef.current,
          offset: d?.length ?? 0,
          ...criteriaCommon,
        } );

        if (!limitTimeoutRef.current) {
          fetchingMoreLimitRef.current = 20;
          limitTimeoutRef.current = setTimeout(()=> {
            fetchingMoreLimitRef.current = 5;
            limitTimeoutRef.current = null;
          }, 1000);
        }

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
