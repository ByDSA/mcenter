/* eslint-disable import/no-cycle */
import { useQueries, useQuery } from "@tanstack/react-query";
import { FetchApi } from "#modules/fetching/fetch-api";
import { getQueryClient } from "#modules/fetching/QueryClientProvider";
import { SeriesApi } from "./requests";
import { SeriesEntity, seriesEntitySchema } from "./models";

const KEY = "series";

type GenQueryOptions = {
  debounce?: boolean;
};

function genQueryFn(id: string, options?: GenQueryOptions) {
  return async ()=> {
    const api = FetchApi.get(SeriesApi);

    if (options?.debounce)
      return fetchSeriesDebounced(id, options);

    const res = await api.getManyByCriteria( {
      filter: {
        id,
      },
      expand: ["countEpisodes", "countSeasons", "imageCover"],
      limit: 1,
      skipCache: true,
    } );

    return res.data[0];
  };
}

function genQuery(id: string, options?: GenQueryOptions) {
  return {
    queryKey: [KEY, id],
    queryFn: genQueryFn(id, options),
    staleTime: 1_000 * 60 * 5,
  };
}

export const useSeries = (id: string | null, options?: GenQueryOptions) => {
  return useQuery(
    id
      ? genQuery(id, {
        ...options,
      } )
      : {
        queryKey: [KEY, null],
        queryFn: () => null,
      },
  );
};

useSeries.get = (id: string, options?: GenQueryOptions) => {
  return getQueryClient().ensureQueryData(genQuery(id, options));
};

useSeries.getCache = (id: string) => {
  return getQueryClient().getQueryData<SeriesEntity>([KEY, id]);
};

useSeries.fetch = (id: string, options?: GenQueryOptions) => {
  const queryOptions = genQuery(id, options);

  // Forzamos staleTime a 0 para asegurar que se ejecute la petición de red
  return getQueryClient().fetchQuery( {
    ...queryOptions,
    staleTime: 0,
  } );
};

useSeries.updateCacheWithMerging = (id: string, entity: Partial<SeriesEntity>) => {
  useSeries.updateCache(id, (oldData: SeriesEntity | undefined) => {
    if (!oldData)
      return seriesEntitySchema.parse(entity);

    return merge(oldData, entity);
  } );
};

type CustomFn = (oldData: SeriesEntity | undefined)=> SeriesEntity;
useSeries.updateCache = (id: string, fn: CustomFn) => {
  getQueryClient().setQueryData([KEY, id], fn);
};

useSeries.invalidateCache = (id: string) => {
  return getQueryClient().invalidateQueries( {
    queryKey: [KEY, id],
  } );
};

export const useManySeries = (ids: string[]) => {
  return useQueries( {
    queries: ids.map(id => {
      return genQuery(id);
    } ),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
        isError: results.some((result) => result.isError),
      };
    },
  } );
};

function merge(oldData: SeriesEntity | undefined, newData: Partial<SeriesEntity>): SeriesEntity {
  const ret = {
    ...oldData,
    ...newData,
  } as SeriesEntity;

  if (newData.imageCoverId === null)
    delete ret.imageCover;

  return ret;
}

/*  ------------------------- */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// Cola de promesas esperando resolución:
type BatchPromise = {
  resolve: (data: SeriesEntity)=> void;
  reject: (err: any)=> void;
};
const batchQueue = new Map<SeriesEntity["id"], Array<BatchPromise>>();
const flushBatch = async (_options?: GenQueryOptions) => {
  const currentBatch = new Map(batchQueue);

  batchQueue.clear();

  const ids = Array.from(currentBatch.keys());

  if (ids.length === 0)
    return;

  try {
    const api = FetchApi.get(SeriesApi);
    const res = await api.getManyByCriteria( {
      filter: {
        ids,
      },
      expand: ["countEpisodes", "countSeasons", "imageCover"],
    } );

    currentBatch.forEach((subscribers, id) => {
      const found = res.data.find((item) => item.id === id);

      if (found) {
        // Resolvemos con el mismo dato TODAS las promesas que esperaban este ID
        subscribers.forEach(sub => sub.resolve(found));
      } else {
        const err = new Error(`Series entity ${id} not found`);

        subscribers.forEach(sub => sub.reject(err));
      }
    } );
  } catch (error) {
    // Si falla la red, fallan todas las promesas pendientes
    currentBatch.forEach((subscribers) => {
      subscribers.forEach(sub => sub.reject(error));
    } );
  }
};
const fetchSeriesDebounced = (id: string, options?: GenQueryOptions): Promise<SeriesEntity> => {
  return new Promise((resolve, reject) => {
    const existingSubscribers = batchQueue.get(id) || [];

    existingSubscribers.push( {
      resolve,
      reject,
    } );
    batchQueue.set(id, existingSubscribers);

    if (debounceTimeout)
      clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(()=>flushBatch(options), 200); // debounce = 200ms
  } );
};
