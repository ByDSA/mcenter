import { Fragment, useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { WithRequired } from "@tanstack/react-query";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { useUser } from "#modules/core/auth/useUser";
import listStyles from "#modules/resources/List.module.css";
import { MusicsApi } from "../requests";
import { MusicEntityWithFileInfos } from "../models";
import { MusicEntryElement } from "./MusicEntry/MusicEntry";
import { ArrayData } from "./types";

type Props = {
  filters: {
    title?: string;
  };
};

type Data = ArrayData;

export function MusicList(props: Props) {
  const { data,
    isLoading,
    error,
    setItem,
    observerTarget,
    totalCount } = useMusicList(props);
  const resultNumbers = (
    <span style={{
      display: "flex",
      justifyContent: "left",
      marginTop: "0.5rem",
      marginLeft: "1rem",
      fontSize: "0.8em",
    }}>
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
          {data!.map((music, i) => (
            <Fragment key={`${music.id}`}>
              <MusicEntryElement
                index={i + 1}
                data={music}
                setData={(newData) => {
                  return setItem(
                    i,
                  newData as WithRequired<MusicEntityWithFileInfos, "userInfo">,
                  );
                }}
              />
            </Fragment>
          ))}
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
  const { user } = useUser();
  const api = FetchApi.get(MusicsApi);
  const expand: NonNullable<MusicsApi.GetManyByCriteria.Criteria["expand"]> = [
    "fileInfos",
    "userInfo",
  ];

  if (user)
    expand.push("favorite");

  const criteriaCommon: MusicsApi.GetManyByCriteria.Criteria = {
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
      const result = await api.getManyByCriteria( {
        limit: 20,
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
          fetchingMoreLimitRef.current = 30;
          limitTimeoutRef.current = setTimeout(() => {
            fetchingMoreLimitRef.current = 15;
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
): MusicsApi.GetManyByCriteria.Criteria["filter"] | undefined {
  const ret: MusicsApi.GetManyByCriteria.Criteria["filter"] = {};

  if (props.filters.title)
    ret.title = props.filters.title;

  if (Object.entries(ret).length === 0)
    return undefined;

  return ret;
}
