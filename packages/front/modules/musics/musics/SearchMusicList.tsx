import { useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { useUser } from "#modules/core/auth/useUser";
import listStyles from "#modules/resources/List/List.module.css";
import { MusicsApi } from "../requests";
import { useMusic } from "../hooks";
import { MusicEntryElement } from "./ListItem/MusicEntry";
import { ArrayData } from "./types";
import styles from "./SearchMusicList.module.css";

type Props = {
  filters: {
    title?: string;
  };
};

type Data = ArrayData;

export function SearchMusicList(props: Props) {
  const { data,
    isLoading,
    error,
    observerTarget,
    totalCount } = useSearchMusicList(props);
  const resultNumbers = (
    <span className={styles.resultNumbers}>
      Resultados: {data?.length} de {totalCount}
    </span>
  );

  return renderFetchedData<Data | null>( {
    data,
    error,
    scroll: {
      observerRef: observerTarget,
    },
    loader: {
      isLoading,
    },
    render: () => (
      <>
        {resultNumbers}
        <br />
        <span className={classes(listStyles.list)}>
          {data!.map((music, i) => {
            return <MusicEntryElement
              key={i + ": " + music.id}
              playable
              musicId={music.id}
            />;
          } )}
        </span>
        {(data?.length ?? 0) > 10 && data?.length === totalCount && resultNumbers}
      </>
    ),
  } );
}

function useSearchMusicList(props: Props) {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const limitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingMoreLimitRef = useRef<number>(15);
  const { user } = useUser();
  const api = FetchApi.get(MusicsApi);
  const expand: NonNullable<MusicCrudDtos.GetMany.Criteria["expand"]> = [
    "fileInfos",
    "imageCover",
  ];

  if (user)
    expand.push("favorite", "userInfo");

  const criteriaCommon: MusicCrudDtos.GetMany.Criteria = {
    sort: {
      added: "desc",
    },
    filter: getFilterFromProps(props),
    expand,
  };
  const { data,
    setData,
    isLoading,
    error,
    setItem, observerTarget,
    fetchInitData } = useCrudDataWithScroll( {
    initialFetch: async () => {
      if (!props.filters.title)
        return [];

      const result = await api.getManyByCriteria( {
        limit: 30,
        ...criteriaCommon,
      } );
      const gotTotalCount = result.metadata?.totalCount;

      if (gotTotalCount !== undefined)
        setTotalCount(gotTotalCount);

      for (const m of result.data)
        useMusic.updateCacheWithMerging(m.id, m);

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
          fetchingMoreLimitRef.current = 30;
          limitTimeoutRef.current = setTimeout(() => {
            fetchingMoreLimitRef.current = 15;
            limitTimeoutRef.current = null;
          }, 1000);
        }

        const gotTotalCount = result.metadata?.totalCount;

        if (gotTotalCount !== undefined)
          setTotalCount(gotTotalCount);

        for (const m of result.data)
          useMusic.updateCacheWithMerging(m.id, m);

        return result.data as Data;
      },
    },
  } );

  useEffect(() => {
    fetchInitData().catch(showError);
  }, [props.filters]);

  return {
    data,
    setData,
    isLoading,
    error,
    totalCount,
    setItem,
    observerTarget,
  };
}

function getFilterFromProps(
  props: Props,
): MusicCrudDtos.GetMany.Criteria["filter"] | undefined {
  const ret: MusicCrudDtos.GetMany.Criteria["filter"] = {};

  if (props.filters.title)
    ret.title = props.filters.title;

  if (Object.entries(ret).length === 0)
    return undefined;

  return ret;
}
