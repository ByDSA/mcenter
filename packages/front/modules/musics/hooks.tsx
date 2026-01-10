import { useQueries, useQuery } from "@tanstack/react-query";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { FetchApi } from "#modules/fetching/fetch-api";
import { getQueryClient } from "#modules/fetching/QueryClientProvider";
import { MusicsApi } from "./requests";
import { MusicEntity, musicEntitySchema } from "./models";

type GenQueryOptions = {
  expand: MusicCrudDtos.GetOne.Criteria["expand"];
};

function genQueryFn(id: string, _options?: GenQueryOptions) {
  return async ()=> {
    const api = FetchApi.get(MusicsApi);
    const res = await api.getOneByCriteria( {
      filter: {
        id,
      },
      expand: ["favorite", "fileInfos", "userInfo", "imageCover"],
    } );

    return res.data;
  };
}

function genQuery(id: string, options?: GenQueryOptions) {
  return {
    queryKey: ["music", id],
    queryFn: genQueryFn(id, options),
    staleTime: 1_000 * 60 * 5,
    structuralSharing: (oldData: MusicEntity | undefined, newData: Partial<MusicEntity>) => {
      if (!oldData)
        return newData;

      return merge(oldData, newData);
    },
  };
}

export const useMusic = (id: string | null, options?: GenQueryOptions) => {
  return useQuery(
    id
      ? genQuery(id, options)
      : {
        queryKey: ["music", null],
        queryFn: () => null,
      },
  );
};

useMusic.get = (id: string, options?: GenQueryOptions) => {
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

  return ret;
}
