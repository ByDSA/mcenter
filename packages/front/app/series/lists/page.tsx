"use client";

import { useState } from "react";
import { SeriesEntity } from "$shared/models/episodes/series";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "#modules/core/logger";
import { ArrayDataProvider } from "#modules/utils/array-data-context";
import { FetchApi } from "#modules/fetching/fetch-api";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { SeriesApi } from "#modules/episodes/series/requests";
import { SeriesList } from "#modules/episodes/series/List/List";
import { PaginationContainer } from "#modules/ui-kit/Pagination/Pagination";
import { NewSeriesButton } from "../../../modules/episodes/series/New/Button";
import styles from "./styles.module.css";

export default function SeriesPage() {
  const [data, setData] = useState<SeriesEntity[]>([]);
  const [totalCount, setTotalCount] = useState<number>();
  const limit = 8;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const fetch = async (nPage: number) => {
    const api = FetchApi.get(SeriesApi);
    const res = await api.getManyByCriteria( {
      limit,
      offset: (nPage - 1) * limit,
      expand: ["countEpisodes", "countSeasons"],
    } );

    return res;
  };
  const addItem = (item: SeriesEntity | ((oldData: SeriesEntity[])=> SeriesEntity[])) => {
    setData((oldData) => {
      const newData = typeof item === "function"
        ? item(oldData)
        : item;

      if (Array.isArray(newData))
        return [...oldData, ...newData];

      return [...oldData, newData];
    } );
  };
  const removeItemByIndex = (index: number) => {
    setData((oldData) => {
      const newData = [...oldData];

      newData.splice(index, 1);

      return newData;
    } );
  };
  const setItemByIndex = (index: number, item: SeriesEntity |
    ((oldData: SeriesEntity)=> SeriesEntity)) => {
    setData((oldData) => {
      const oldItem: SeriesEntity = oldData[index];
      const newItem: SeriesEntity = typeof item === "function" ? item(oldItem) : item;

      return oldData.map((current, i) => (i === index ? newItem : current));
    } );
  };

  return (<>
    <header className={styles.header}>
      <NewSeriesButton onSuccess={async (newValue) => {
        const res = await fetch(page);

        setData(res.data);
        setTotalCount(res.metadata?.totalCount);

        logger.debug(
          `Nueva serie creada: ${newValue.name}`,
        );
      }}/>
    </header>
    <PaginationContainer
      maxValue={Math.ceil((totalCount ?? 0) / limit)}
      initialPageIndex={page}
      position="top"
      onChange={async (details)=> {
        const n = details.pageIndex;
        const res = await fetch(n);

        router.push(`?${new URLSearchParams( {
          ...Object.fromEntries(searchParams),
          page: String(n),
        } ).toString()}`);

        setData(res.data);
        setTotalCount(res.metadata?.totalCount);
      }}
    >
      <AsyncLoader
        action={()=>fetch(page)}
        onSuccess={(res)=>{
          setData(res.data);
          setTotalCount(res.metadata?.totalCount);
        }
        }
      >
        <ArrayDataProvider
          data={data}
          addItem={addItem}
          removeItemByIndex={removeItemByIndex}
          setItemByIndex={setItemByIndex}
        >
          <SeriesList
            className={styles.list}
            data={data}
          />
        </ArrayDataProvider>
      </AsyncLoader>
    </PaginationContainer>
  </>
  );
}
