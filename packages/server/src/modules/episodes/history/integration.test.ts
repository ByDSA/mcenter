import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { Types } from "mongoose";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { createMockedModule } from "#utils/nestjs/tests";
import { StreamsCrudModule } from "#episodes/streams/crud/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { loadFixtureSampleSeries } from "#core/db/tests/fixtures/sets/SampleSeries";
import { sleep } from "#utils";
import { EpisodeHistoryRepository } from "./crud/repository";
import { EpisodeLastTimePlayedService } from "./last-time-played/service";

describe("integration: EpisodeHistoryRepository <-> EpisodesUsersRepository", () => {
  let testingSetup: TestingSetup;
  let historyRepo: EpisodeHistoryRepository;
  let usersInfoRepo: EpisodesUsersRepository;
  const user = fixtureUsers.Normal.User;
  const episode = fixtureEpisodes.SampleSeries.Samples.EP1x01;
  const options = {
    requestingUserId: user.id,
  };

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(StreamsCrudModule),
        DomainEventEmitterModule,
      ],
      controllers: [],
      providers: [
        EpisodeHistoryRepository,
        EpisodesUsersRepository,
        EpisodeLastTimePlayedService, // Necesario por procesado de mensajes
      ],
    }, {
      db: {
        using: "default",
      },
    } );

    historyRepo = await testingSetup.app.get(EpisodeHistoryRepository);
    usersInfoRepo = await testingSetup.app.get(EpisodesUsersRepository);

    await loadFixtureSampleSeries();
  } );

  beforeEach(async () => {
    jest.clearAllMocks();
    await historyRepo.deleteAllAndGet(options);
  } );

  describe("cuando se crea una nueva entrada en el historial", () => {
    it(
      "debería actualizar el lastTimePlayed del episodio al crear la primera entrada",
      async () => {
      // Arrange
        const createDate = new Date();
        const createEntry = {
          date: createDate,
          resourceId: episode.id,
          streamId: new Types.ObjectId().toString(),
        };

        // Act
        await historyRepo.createOneAndGet(createEntry, options);

        // Esperamos a que se procesen los eventos
        await sleep(100);

        // Assert - verificar efecto real en la base de datos
        const userInfo = await usersInfoRepo.getOneById( {
          userId: user.id,
          episodeId: episode.id,
        } );

        expect(userInfo).not.toBeNull();
        expect(userInfo!.lastTimePlayed).toBeDefined();
        expect(userInfo!.lastTimePlayed).toEqual(createDate);
      },
    );

    it("debería actualizar el lastTimePlayed al crear una entrada más reciente", async () => {
      // Arrange
      const firstDate = new Date("2024-01-01T10:00:00Z");
      const secondDate = new Date("2024-01-02T15:00:00Z");
      const streamId = new Types.ObjectId().toString();

      // Crear primera entrada
      await historyRepo.createOneAndGet( {
        date: firstDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await sleep(100);

      // Verificar que se actualizó con la primera fecha
      const userInfoAfterFirst = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      expect(userInfoAfterFirst).not.toBeNull();
      expect(userInfoAfterFirst!.lastTimePlayed).toEqual(firstDate);

      // Act - crear segunda entrada más reciente
      await historyRepo.createOneAndGet( {
        date: secondDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await sleep(100);

      // Assert - verificar que se actualizó con la segunda fecha más reciente
      const userInfoAfterSecond = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      expect(userInfoAfterSecond).not.toBeNull();
      expect(userInfoAfterSecond!.lastTimePlayed).toEqual(secondDate);
      expect(userInfoAfterSecond!.lastTimePlayed?.getTime()).toBeGreaterThan(firstDate.getTime());
    } );

    it("no debería cambiar el lastTimePlayed si la nueva entrada es más antigua", async () => {
      // Arrange
      const recentDate = new Date("2024-01-05T15:00:00Z");
      const olderDate = new Date("2024-01-01T10:00:00Z");
      const streamId = new Types.ObjectId().toString();

      // Crear entrada reciente
      await historyRepo.createOneAndGet( {
        date: recentDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await sleep(100);

      const userInfoBeforeOlderEntry = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      expect(userInfoBeforeOlderEntry).not.toBeNull();

      // Act - crear entrada más antigua
      await historyRepo.createOneAndGet( {
        date: olderDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await sleep(100);

      // Assert - verificar que NO cambió el lastTimePlayed
      const userInfoAfterOlderEntry = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      expect(userInfoAfterOlderEntry).not.toBeNull();
      expect(userInfoAfterOlderEntry!.lastTimePlayed).toEqual(
        userInfoBeforeOlderEntry!.lastTimePlayed,
      );
      expect(userInfoAfterOlderEntry!.lastTimePlayed).toEqual(recentDate);
    } );
  } );

  describe("cuando se elimina una entrada del historial", () => {
    it("debería actualizar el lastTimePlayed cuando se elimina una entrada", async () => {
      // Arrange
      const createDate = new Date();
      const streamId = new Types.ObjectId().toString();

      await historyRepo.createOneAndGet( {
        date: createDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await sleep(100);

      const entries = await historyRepo.getManyByCriteria( {
        filter: {
          episodeId: episode.id,
        },
      }, options);
      const entryId = entries[0].id;

      // Act
      await historyRepo.deleteOneByIdAndGet(entryId, options);

      // Esperamos a que se procesen los eventos
      await sleep(100);

      // Assert - verificar efecto real: lastTimePlayed debe estar undefined
      const userInfo = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      expect(userInfo).not.toBeNull();
      expect(userInfo!.lastTimePlayed).toBeNull();
    } );

    it(
      "debería establecer lastTimePlayed a undefined cuando se elimina la única entrada",
      async () => {
      // Arrange
        const createDate = new Date();
        const streamId = new Types.ObjectId().toString();

        await historyRepo.createOneAndGet( {
          date: createDate,
          resourceId: episode.id,
          streamId,
        }, options);

        await sleep(100);

        const entries = await historyRepo.getManyByCriteria( {
          filter: {
            episodeId: episode.id,
          },
        }, options);
        const entryId = entries[0].id;

        // Act
        await historyRepo.deleteOneByIdAndGet(entryId, options);

        // Esperamos a que se procesen los eventos
        await sleep(100);

        // Assert - verificar que el campo se estableció como undefined en la BD
        const userInfo = await usersInfoRepo.getOneById( {
          userId: user.id,
          episodeId: episode.id,
        } );

        expect(userInfo).not.toBeNull();
        expect(userInfo!.lastTimePlayed).toBeNull();
      },
    );

    it(
      "debería actualizar lastTimePlayed a la entrada más reciente cuando se elimina la última",
      async () => {
      // Arrange
        const firstDate = new Date("2024-01-01T10:00:00Z");
        const secondDate = new Date("2024-01-02T15:00:00Z");
        const streamId = new Types.ObjectId().toString();

        // Crear dos entradas
        await historyRepo.createOneAndGet( {
          date: firstDate,
          resourceId: episode.id,
          streamId,
        }, options);

        await historyRepo.createOneAndGet( {
          date: secondDate,
          resourceId: episode.id,
          streamId,
        }, options);

        await sleep(100);

        // Obtener la entrada más reciente
        const entries = await historyRepo.getManyByCriteria( {
          filter: {
            episodeId: episode.id,
          },
        }, options);
        const latestEntry = entries.reduce(
          (latest, current) => current.date > latest.date ? current : latest,
        );

        // Act - eliminar la entrada más reciente
        await historyRepo.deleteOneByIdAndGet(latestEntry.id, options);

        // Esperamos a que se procesen los eventos
        await sleep(100);

        // Assert - verificar que se actualizó al valor de la primera fecha
        const userInfo = await usersInfoRepo.getOneById( {
          userId: user.id,
          episodeId: episode.id,
        } );

        expect(userInfo).not.toBeNull();
        expect(userInfo!.lastTimePlayed).toEqual(firstDate);
        expect(userInfo!.lastTimePlayed?.getTime()).toBeLessThan(secondDate.getTime());
      },
    );

    it(
      "debería mantener el lastTimePlayed correcto cuando se elimina una entrada antigua",
      async () => {
      // Arrange
        const firstDate = new Date("2024-01-01T10:00:00Z");
        const secondDate = new Date("2024-01-02T15:00:00Z");
        const thirdDate = new Date("2024-01-03T20:00:00Z");
        const streamId = new Types.ObjectId().toString();

        // Crear tres entradas
        await historyRepo.createOneAndGet( {
          date: firstDate,
          resourceId: episode.id,
          streamId,
        }, options);

        await historyRepo.createOneAndGet( {
          date: secondDate,
          resourceId: episode.id,
          streamId,
        }, options);

        await historyRepo.createOneAndGet( {
          date: thirdDate,
          resourceId: episode.id,
          streamId,
        }, options);

        await sleep(100);

        const userInfoBeforeDelete = await usersInfoRepo.getOneById( {
          userId: user.id,
          episodeId: episode.id,
        } );

        expect(userInfoBeforeDelete).not.toBeNull();

        const entries = await historyRepo.getManyByCriteria( {
          filter: {
            episodeId: episode.id,
          },
        }, options);
        const oldestEntry = entries.reduce(
          (oldest, current) => current.date < oldest.date ? current : oldest,
        );

        // Act - eliminar la entrada más antigua
        await historyRepo.deleteOneByIdAndGet(oldestEntry.id, options);

        // Esperamos a que se procesen los eventos
        await sleep(100);

        // Assert - verificar que el lastTimePlayed NO cambió
        const userInfoAfterDelete = await usersInfoRepo.getOneById( {
          userId: user.id,
          episodeId: episode.id,
        } );

        expect(userInfoAfterDelete).not.toBeNull();
        expect(userInfoAfterDelete!.lastTimePlayed).toEqual(
          userInfoBeforeDelete!.lastTimePlayed,
        );
        expect(userInfoAfterDelete!.lastTimePlayed).toEqual(thirdDate);
      },
    );
  } );

  describe("cuando se eliminan todas las entradas", () => {
    it(
      "debería establecer lastTimePlayed a null cuando se eliminan todas las entradas",
      async () => {
      // Arrange
        const streamId = new Types.ObjectId().toString();

        // Crear varias entradas
        await historyRepo.createOneAndGet( {
          date: new Date("2024-01-01T10:00:00Z"),
          resourceId: episode.id,
          streamId,
        }, options);

        await historyRepo.createOneAndGet( {
          date: new Date("2024-01-02T15:00:00Z"),
          resourceId: episode.id,
          streamId,
        }, options);

        await sleep(100);

        // Act
        await historyRepo.deleteAllAndGet(options);

        // Esperamos a que se procesen los eventos
        await sleep(100);

        // Assert - verificar que se estableció como undefined
        const userInfo = await usersInfoRepo.getOneById( {
          userId: options.requestingUserId,
          episodeId: episode.id,
        } );

        expect(userInfo).not.toBeNull();
        expect(userInfo!.lastTimePlayed).toBeNull();
      },
    );
  } );

  describe("escenarios de múltiples episodios", () => {
    const episode2 = fixtureEpisodes.SampleSeries.Samples.EP1x02;

    it("debería mantener lastTimePlayed independiente para cada episodio", async () => {
      // Arrange
      const date1 = new Date("2024-01-01T10:00:00Z");
      const date2 = new Date("2024-01-02T15:00:00Z");
      const streamId = new Types.ObjectId().toString();

      // Crear entradas para diferentes episodios
      await historyRepo.createOneAndGet( {
        date: date1,
        resourceId: episode.id,
        streamId,
      }, options);

      await historyRepo.createOneAndGet( {
        date: date2,
        resourceId: episode2.id,
        streamId,
      }, options);

      await sleep(100);

      // Assert - verificar valores independientes en la BD
      const userInfo1 = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );
      const userInfo2 = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode2.id,
      } );

      expect(userInfo1).not.toBeNull();
      expect(userInfo2).not.toBeNull();
      expect(userInfo1!.lastTimePlayed).toEqual(date1);
      expect(userInfo2!.lastTimePlayed).toEqual(date2);
      expect(userInfo1!.lastTimePlayed).not.toEqual(userInfo2!.lastTimePlayed);
    } );

    it("debería actualizar solo el episodio correspondiente al eliminar una entrada", async () => {
      // Arrange
      const date1 = new Date("2024-01-01T10:00:00Z");
      const date2 = new Date("2024-01-02T15:00:00Z");
      const streamId = new Types.ObjectId().toString();

      await historyRepo.createOneAndGet( {
        date: date1,
        resourceId: episode.id,
        streamId,
      }, options);

      await historyRepo.createOneAndGet( {
        date: date2,
        resourceId: episode2.id,
        streamId,
      }, options);

      await sleep(100);

      const entries = await historyRepo.getManyByCriteria( {
        filter: {
          episodeId: episode.id,
        },
      }, options);
      const userInfo2Before = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode2.id,
      } );

      expect(userInfo2Before).not.toBeNull();

      // Act - eliminar entrada del episodio 1
      await historyRepo.deleteOneByIdAndGet(entries[0].id, options);

      // Esperamos a que se procesen los eventos
      await sleep(100);

      // Assert - verificar que solo cambió el episodio 1
      const userInfo1After = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );
      const userInfo2After = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode2.id,
      } );

      expect(userInfo1After).not.toBeNull();
      expect(userInfo2After).not.toBeNull();
      expect(userInfo1After!.lastTimePlayed).toBeNull();
      expect(userInfo2After!.lastTimePlayed).toEqual(userInfo2Before!.lastTimePlayed);
    } );
  } );

  describe("escenarios con fechas edge case", () => {
    beforeEach(async ()=> {
      await historyRepo.deleteAllAndGet(options);
    } );

    it("debería manejar correctamente entradas con la misma fecha", async () => {
      // Arrange
      const sameDate = new Date("2024-01-01T10:00:00Z");
      const streamId = new Types.ObjectId().toString();

      // Crear dos entradas con la misma fecha
      await historyRepo.createOneAndGet( {
        date: sameDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await historyRepo.createOneAndGet( {
        date: sameDate,
        resourceId: episode.id,
        streamId,
      }, options);

      await sleep(100);

      // Assert - verificar que se estableció correctamente
      const userInfo = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      expect(userInfo).not.toBeNull();
      expect(userInfo!.lastTimePlayed).toEqual(sameDate);
    } );

    it("debería retornar undefined para un episodio que nunca se ha reproducido", async () => {
      const userInfo = await usersInfoRepo.getOneById( {
        userId: user.id,
        episodeId: episode.id,
      } );

      // Assert
      expect(userInfo).not.toBeNull();
      expect(userInfo!.lastTimePlayed).toBeNull();
    } );
  } );
} );
