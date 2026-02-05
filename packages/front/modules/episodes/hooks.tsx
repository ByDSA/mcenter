/* eslint-disable import/no-cycle */
import { useQueries, useQuery } from "@tanstack/react-query";
import { FetchApi } from "#modules/fetching/fetch-api";
import { getQueryClient } from "#modules/fetching/QueryClientProvider";
import { EpisodesApi } from "./requests";
import { EpisodeEntity, episodeEntitySchema } from "./models";

type GenQueryOptions = {
  debounce?: boolean;
  hasUser?: boolean;
};

const KEY = "episode";

function genQueryFn(id: string, options?: GenQueryOptions) {
  return async ()=> {
    const api = FetchApi.get(EpisodesApi);

    if (options?.debounce)
      return fetchEpisodesDebounced(id, options);

    const res = await api.getOneById(
      id,
      {
        expand: getExpand(options?.hasUser ?? false),
        skipCache: true,
      },
    );

    return res.data;
  };
}

function genQuery(id: string, options?: GenQueryOptions) {
  return {
    queryKey: [KEY, id],
    queryFn: genQueryFn(id, options),
    staleTime: 1_000 * 60 * 5,
  };
}

export const useEpisode = (id: string | null, options?: GenQueryOptions) => {
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

useEpisode.get = (id: string, options?: GenQueryOptions) => {
  return getQueryClient().ensureQueryData(genQuery(id, options));
};

useEpisode.getCache = (id: string) => {
  return getQueryClient().getQueryData<EpisodeEntity>([KEY, id]);
};

useEpisode.fetch = (id: string, options?: GenQueryOptions) => {
  const queryOptions = genQuery(id, options);

  // Forzamos staleTime a 0 para asegurar que se ejecute la petición de red
  return getQueryClient().fetchQuery( {
    ...queryOptions,
    staleTime: 0,
  } );
};

useEpisode.updateCacheWithMerging = (id: string, entity: Partial<EpisodeEntity>) => {
  useEpisode.updateCache(id, (oldData: EpisodeEntity | undefined) => {
    if (!oldData)
      return episodeEntitySchema.parse(entity);

    return merge(oldData, entity);
  } );
};

type CustomFn = (oldData: EpisodeEntity | undefined)=> EpisodeEntity;
useEpisode.updateCache = (id: string, fn: CustomFn) => {
  getQueryClient().setQueryData([KEY, id], fn);
};

useEpisode.invalidateCache = (id: string) => {
  return getQueryClient().invalidateQueries( {
    queryKey: [KEY, id],
  } );
};

export const useManyEpisods = (ids: string[]) => {
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

function merge(oldData: EpisodeEntity | undefined, newData: Partial<EpisodeEntity>): EpisodeEntity {
  const ret = {
    ...oldData,
    ...newData,
  } as EpisodeEntity;

  if (newData.imageCoverId === null)
    delete ret.imageCover;

  return ret;
}

/*  ------------------------- */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// Cola de promesas esperando resolución:
type BatchPromise = {
  resolve: (data: EpisodeEntity)=> void;
  reject: (err: any)=> void;
};
const batchQueue = new Map<EpisodeEntity["id"], Array<BatchPromise>>();
const flushBatch = async (options?: GenQueryOptions) => {
  const currentBatch = new Map(batchQueue);

  batchQueue.clear();

  const ids = Array.from(currentBatch.keys());

  if (ids.length === 0)
    return;

  try {
    const api = FetchApi.get(EpisodesApi);
    const res = await api.getManyByCriteria( {
      filter: {
        ids,
      },
      expand: getExpand(options?.hasUser ?? false),
    } );

    currentBatch.forEach((subscribers, id) => {
      const found = res.data.find((item) => item.id === id);

      if (found) {
        // Resolvemos con el mismo dato TODAS las promesas que esperaban este ID
        subscribers.forEach(sub => sub.resolve(found));
      } else {
        const err = new Error(`Episode entity ${id} not found`);

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
const fetchEpisodesDebounced = (id: string, options?: GenQueryOptions): Promise<EpisodeEntity> => {
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

function getExpand(hasUser: boolean) {
  return [
    ...(hasUser ? ["userInfo"] as any[] : []), "fileInfos",
    "imageCover",
  ];
}
