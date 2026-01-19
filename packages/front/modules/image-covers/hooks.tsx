/* eslint-disable import/no-cycle */
import { useQueries, useQuery } from "@tanstack/react-query";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { FetchApi } from "#modules/fetching/fetch-api";
import { getQueryClient } from "#modules/fetching/QueryClientProvider";
import { ImageCoversApi } from "./requests";
import { ImageCoverEntity, imageCoverEntitySchema } from "./models";

type GenQueryOptions = {
  expand?: ImageCoverCrudDtos.GetOne.Criteria["expand"];
  debounce?: boolean;
};

const KEY = "imageCover";

function genQueryFn(id: string, options?: GenQueryOptions) {
  return async ()=> {
    const api = FetchApi.get(ImageCoversApi);

    if (options?.debounce)
      return fetchMusicDebounced(id, options);

    const res = await api.getOneByCriteria( {
      filter: {
        id,
      },
      skipCache: true,
    } );

    return res.data;
  };
}

function genQuery(id: string, options?: GenQueryOptions) {
  return {
    queryKey: [KEY, id],
    queryFn: genQueryFn(id, options),
    staleTime: 1_000 * 60 * 5,
    structuralSharing: (
      oldData: ImageCoverEntity | undefined,
      newData: Partial<ImageCoverEntity>,
    ) => {
      if (!oldData)
        return newData as ImageCoverEntity;

      return merge(oldData, newData);
    },
  };
}

export const useImageCover = (id: string | null, options?: GenQueryOptions) => {
  return useQuery(
    id
      ? genQuery(id, options)
      : {
        queryKey: [KEY, null],
        queryFn: () => null,
      },
  );
};

useImageCover.get = (id: string, options?: GenQueryOptions) => {
  return getQueryClient().ensureQueryData(genQuery(id, options));
};

useImageCover.getCache = (id: string) => {
  return getQueryClient().getQueryData<ImageCoverEntity>([KEY, id]);
};

useImageCover.fetch = (id: string, options?: GenQueryOptions) => {
  return getQueryClient().fetchQuery(genQuery(id, options));
};

useImageCover.updateCacheWithMerging = (id: string, entity: Partial<ImageCoverEntity>) => {
  useImageCover.updateCache(id, (oldData: ImageCoverEntity | undefined) => {
    if (!oldData)
      return imageCoverEntitySchema.parse(entity);

    return merge(oldData, entity);
  } );
};

type CustomFn = (oldData: ImageCoverEntity | undefined)=> ImageCoverEntity;
useImageCover.updateCache = (id: string, fn: CustomFn) => {
  getQueryClient().setQueryData([KEY, id], fn);
};

useImageCover.invalidateCache = (id: string) => {
  return getQueryClient().invalidateQueries( {
    queryKey: [KEY, id],
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

function merge(
  oldData: ImageCoverEntity | undefined,
  newData: Partial<ImageCoverEntity>,
): ImageCoverEntity {
  const ret = {
    ...oldData,
    ...newData,
  } as ImageCoverEntity;

  return ret;
}

/*  ------------------------- */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// Cola de promesas esperando resolución:
type BatchPromise = {
  resolve: (data: ImageCoverEntity)=> void;
  reject: (err: any)=> void;
};
const batchQueue = new Map<ImageCoverEntity["id"], Array<BatchPromise>>();
const flushBatch = async (_options?: GenQueryOptions) => {
  const currentBatch = new Map(batchQueue);

  batchQueue.clear();

  const ids = Array.from(currentBatch.keys());

  if (ids.length === 0)
    return;

  try {
    const api = FetchApi.get(ImageCoversApi);
    const res = await api.getManyByCriteria( {
      filter: {
        ids,
      },
    } );

    currentBatch.forEach((subscribers, id) => {
      const found = res.data.find((item) => item.id === id);

      if (found) {
        // Resolvemos con el mismo dato TODAS las promesas que esperaban este ID
        subscribers.forEach(sub => sub.resolve(found));
      } else {
        const err = new Error(`Image Cover entity ${id} not found`);

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
const fetchMusicDebounced = (id: string, options?: GenQueryOptions): Promise<ImageCoverEntity> => {
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
