/* eslint-disable import/no-cycle */
import { useQueries, useQuery } from "@tanstack/react-query";
import { FetchApi } from "#modules/fetching/fetch-api";
import { getQueryClient } from "#modules/fetching/QueryClientProvider";
import { useUser } from "#modules/core/auth/useUser";
import { MusicsApi } from "./requests";
import { MusicEntity, musicEntitySchema } from "./models";

type GenQueryOptions = {
  debounce?: boolean;
  hasUser?: boolean;
};

function genQueryFn(id: string, options?: GenQueryOptions) {
  return async ()=> {
    const api = FetchApi.get(MusicsApi);

    if (options?.debounce)
      return fetchMusicDebounced(id, options);

    const res = await api.getOneByCriteria( {
      filter: {
        id,
      },
      expand: getExpand(options?.hasUser ?? false),
      skipCache: true,
    } );

    return res.data;
  };
}

function genQuery(id: string, options?: GenQueryOptions) {
  return {
    queryKey: ["music", id],
    queryFn: genQueryFn(id, options),
    staleTime: 1_000 * 60 * 5,
    refetchOnMount: (query) => {
      const data = query.state.data as MusicEntity | undefined;

      // Si no hay datos, refetch normal
      if (!data)
        return true;

      const missingFields = data.userInfo === undefined;

      // Si faltan campos, retornamos 'always' para forzar el refetch AHORA MISMO
      // Si no faltan, retornamos false (o undefined) para respetar el staleTime global
      return missingFields ? "always" : false;
    },
    structuralSharing: (oldData: MusicEntity | undefined, newData: Partial<MusicEntity>) => {
      if (!oldData)
        return newData as MusicEntity;

      return merge(oldData, newData);
    },
  };
}

export const useMusic = (id: string | null, options?: Omit<GenQueryOptions, "hasUser">) => {
  const { user } = useUser();

  return useQuery(
    id
      ? genQuery(id, {
        ...options,
        hasUser: !!user,
      } )
      : {
        queryKey: ["music", null],
        queryFn: () => null,
      },
  );
};

useMusic.get = (id: string, options?: GenQueryOptions) => {
  if (options?.hasUser) {
    const isMissingUserFields = !!useMusic.getCache(id)?.userInfo;

    if (isMissingUserFields)
      return useMusic.fetch(id, options);
  }

  return getQueryClient().ensureQueryData(genQuery(id, options));
};

useMusic.getCache = (id: string) => {
  return getQueryClient().getQueryData<MusicEntity>(["music", id]);
};

useMusic.fetch = (id: string, options?: GenQueryOptions) => {
  return getQueryClient().fetchQuery(genQuery(id, options));
};

useMusic.updateCacheWithMerging = (id: string, entity: Partial<MusicEntity>) => {
  useMusic.updateCache(id, (oldData: MusicEntity | undefined) => {
    if (!oldData)
      return musicEntitySchema.parse(entity);

    return merge(oldData, entity);
  } );
};

type CustomFn = (oldData: MusicEntity | undefined)=> MusicEntity;
useMusic.updateCache = (id: string, fn: CustomFn) => {
  getQueryClient().setQueryData(["music", id], fn);
};

useMusic.invalidateCache = (id: string) => {
  return getQueryClient().invalidateQueries( {
    queryKey: ["music", id],
  } );
};

export const useMusics = (ids: string[]) => {
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

const OPTIONAL_KEYS = ["disabled", "album", "country",
  "game", "tags", "spotifyId", "year"] as (keyof MusicEntity)[];

function merge(oldData: MusicEntity | undefined, newData: Partial<MusicEntity>): MusicEntity {
  const ret = {
    ...oldData,
    ...newData,
    userInfo: newData.userInfo ?? oldData?.userInfo,
    fileInfos: newData.fileInfos ?? oldData?.fileInfos,
  } as MusicEntity;

  if (newData.imageCoverId === null) {
    delete ret.imageCoverId;
    delete ret.imageCover;
  }

  for (const op of OPTIONAL_KEYS) {
    if (newData[op] === undefined)
      delete ret[op];
  }

  return ret;
}

/*  ------------------------- */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// Cola de promesas esperando resolución:
type BatchPromise = {
  resolve: (data: MusicEntity)=> void;
  reject: (err: any)=> void;
};
const batchQueue = new Map<MusicEntity["id"], Array<BatchPromise>>();
const flushBatch = async (options?: GenQueryOptions) => {
  const currentBatch = new Map(batchQueue);

  batchQueue.clear();

  const ids = Array.from(currentBatch.keys());

  if (ids.length === 0)
    return;

  try {
    const api = FetchApi.get(MusicsApi);
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
        const err = new Error(`Music entity ${id} not found`);

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
const fetchMusicDebounced = (id: string, options?: GenQueryOptions): Promise<MusicEntity> => {
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
    ...(hasUser ? ["favorite", "userInfo"] as any[] : []), "fileInfos",
    "imageCover",
  ];
}
