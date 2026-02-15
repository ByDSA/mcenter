/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeEntity } from "#episodes/models";
import { EpisodeHistoryRepository } from "../repository";

const SAMPLE_HISTORY_ENTRY = fixtureEpisodes.HistoryEntries.List[0];

class EpisodeHistoryRepositoryMock extends createMockClass(EpisodeHistoryRepository) {
  constructor() {
    super();

    this.createOneAndGet.mockImplementation((entry, options) => Promise.resolve( {
      ...entry,
      id: new Types.ObjectId().toString(),
      userId: options.requestingUserId,
    } ));

    this.getAll.mockResolvedValue([SAMPLE_HISTORY_ENTRY]);

    this.getManyBySeriesId.mockImplementation(async (serieId, options)=>{
      let ret = fixtureEpisodes.HistoryEntries.List
        .filter(h=>{
          if (h.userId !== options.requestingUserId)
            return false;

          const episode = fixtureEpisodes.Episodes.List.find(e=>e.id === h.resourceId);

          if (serieId !== episode?.seriesId)
            return false;

          return true;
        } );

      ret = ret.map(h=> {
        const episode = fixtureEpisodes.Episodes.List.find(e=>e.id === h.resourceId);

        return {
          ...h,
          resource: episode,
        };
      } );

      return ret;
    } );

    this.getManyByCriteria.mockImplementation(async (criteria, options) => {
      let ret = fixtureEpisodes.HistoryEntries.List
        .filter(h => {
          if (criteria.filter?.episodeId && criteria.filter.episodeId !== h.resourceId)
            return false;

          if (h.userId !== options.requestingUserId)
            return false;

          const episode = fixtureEpisodes.Episodes.List.find(e=>e.id === h.resourceId);

          if (criteria.filter?.seriesId && criteria.filter.seriesId !== episode?.seriesId)
            return false;

          if (criteria.filter?.episodeKey && criteria.filter.episodeKey !== episode?.episodeKey)
            return false;

          return true;
        } );

      if (criteria.expand) {
        if (criteria.expand.includes("episodes")) {
          ret = ret.map(h=>{
            const result = fixtureEpisodes.Episodes.List.find(e=>e.id === h.resourceId);

            if (!result)
              return h;

            const r: EpisodeEntity = {
              ...result,
            };

            if (criteria.expand?.includes("episodesSeries")) {
              const series = fixtureEpisodes.Series.List.find(s=>s.id === r?.seriesId);

              r.series = series;
            }

            if (criteria.expand?.includes("episodesFileInfos")) {
              const fileInfos = fixtureEpisodes.FileInfos.List.filter(f=>f.episodeId === r.id);

              r.fileInfos = fileInfos;
            }

            if (criteria.expand?.includes("episodesUserInfo")) {
              const userInfo = fixtureEpisodes.UserInfo.List
                .find(f=>f.userId === options.requestingUserId);

              r.userInfo = userInfo;
            }

            return {
              ...h,
              resource: r,
            };
          } );
        }
      }

      return ret;
    } );

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_HISTORY_ENTRY);

    this.deleteAllAndGet.mockResolvedValue([SAMPLE_HISTORY_ENTRY]);

    this.findLastByEpisodeId.mockResolvedValue(SAMPLE_HISTORY_ENTRY);

    this.findLast.mockResolvedValue(SAMPLE_HISTORY_ENTRY);

    this.isLast.mockResolvedValue(false);

    this.createNewEntryNowFor.mockImplementation((props, options) => Promise.resolve( {
      id: new Types.ObjectId().toString(),
      resourceId: props.episodeId,
      date: new Date(),
      streamId: props.streamId ?? new Types.ObjectId().toString(),
      userId: options.requestingUserId,
    } ));

    this.addEpisodesToHistory.mockResolvedValue(undefined);
  }
}

registerMockProviderInstance(EpisodeHistoryRepository, new EpisodeHistoryRepositoryMock());
