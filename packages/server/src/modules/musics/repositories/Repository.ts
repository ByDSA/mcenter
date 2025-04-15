import { statSync } from "node:fs";
import path from "node:path";
import NodeID3 from "node-id3";
import { assertIsDefined } from "#shared/utils/validation";
import { showError } from "#shared/utils/errors/showError";
import { Event } from "#utils/message-broker";
import { CanGetOneById, CanPatchOneById } from "#utils/layers/repository";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { EventType, ModelEvent, PatchEvent } from "#utils/event-sourcing";
import { md5FileAsync } from "#utils/crypt";
import { ARTIST_EMPTY, Music, MusicId, MusicVO } from "#musics/models";
import { MusicHistoryEntry } from "#musics/history/models";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { AUDIO_EXTENSIONS } from "../files";
import { QUEUE_NAME as HISTORY_QUEUE_NAME } from "../history/events";
import { getFullPath } from "../utils";
import { download } from "../youtube";
import { musicDocOdmToModel, patchParamsToUpdateQuery } from "./adapters";
import { QUEUE_NAME } from "./events";
import { DocOdm, ModelOdm } from "./odm";
import { findParamsToQueryParams } from "./queries/QueriesOdm";
import { ExpressionNode } from "./queries/QueryObject";
import { PatchOneParams } from "./types";
import { MusicUrlGenerator } from "./UrlGenerator";

const DEPS_MAP = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicRepository
implements CanPatchOneById<Music, MusicId, PatchOneParams>,
CanGetOneById<Music, MusicId> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);

    this.#deps.domainMessageBroker.subscribe(HISTORY_QUEUE_NAME, async (_ev: Event<unknown>) => {
      const event = _ev as ModelEvent<MusicHistoryEntry>;

      if (event.type !== EventType.CREATED)
        return;

      const id = event.payload.entity.resourceId;
      const lastTimePlayed = event.payload.entity.date.timestamp;

      await this.patchOneById(id, {
        entity: {
          lastTimePlayed,
        },
      } ).catch(showError);
    } ).catch(showError);
  }

  async getOneById(id: string): Promise<Music | null> {
    const docOdm = await ModelOdm.findById(id);

    if (!docOdm)
      return null;

    return musicDocOdmToModel(docOdm);
  }

  async patchOneById(id: string, params: PatchOneParams): Promise<void> {
    const { entity } = params;
    const updateQuery = patchParamsToUpdateQuery(params);

    updateQuery.timestamps ??= {};
    updateQuery.timestamps.updatedAt = new Date();

    await ModelOdm.findByIdAndUpdate(id, updateQuery);

    for (const [k, value] of Object.entries(entity)) {
      const key = k as keyof Music;
      const event = new PatchEvent<Music, MusicId>( {
        entityId: id,
        key,
        value,
      } );

      await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
    }

    for (const p of params.unset ?? []) {
      const event = new PatchEvent<Music, MusicId>( {
        entityId: id,
        key: p.join(".") as keyof Music,
        value: undefined,
      } );

      await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
    }
  }

  async #findOne(query: Parameters<typeof ModelOdm.findOne>[0]): Promise<Music | null> {
    const musicOdm: DocOdm | null = await ModelOdm.findOne(query);

    if (!musicOdm)
      return null;

    return musicDocOdmToModel(musicOdm);
  }

  findOneByHash(hash: string): Promise<Music | null> {
    return this.#findOne( {
      hash,
    } );
  }

  findOneByUrl(url: string): Promise<Music | null> {
    return this.#findOne( {
      url,
    } );
  }

  async findAll(): Promise<Music[]> {
    const docOdms = await ModelOdm.find( {} );
    const ret = docOdms.map((docOdm) => musicDocOdmToModel(docOdm));

    return ret;
  }

  async find(params: ExpressionNode): Promise<Music[]> {
    const query = findParamsToQueryParams(params);
    const docOdms = await ModelOdm.find(query);
    const ret = docOdms.map((docOdm) => musicDocOdmToModel(docOdm));

    return ret;
  }

  findOneByPath(relativePath: string): Promise<Music | null> {
    return this.#findOne( {
      path: relativePath,
    } );
  }

  async createOneFromPath(relativePath: string): Promise<Music> {
    const fullPath = getFullPath(relativePath);
    const id3Tags = NodeID3.read(fullPath);
    const title = id3Tags.title ?? getTitleFromFilenamePath(fullPath);
    const artist = id3Tags.artist ?? ARTIST_EMPTY;
    const urlGenerator = new MusicUrlGenerator( {
      musicRepository: this,
    } );
    const urlPromise = urlGenerator.generateAvailableUrlFrom( {
      title,
      artist,
    } );
    const hashPromise = md5FileAsync(fullPath);
    const { size } = statSync(fullPath);
    const now = new Date();
    const newDocOdm: Omit<DocOdm, "_id"> = {
      hash: await hashPromise,
      size,
      path: relativePath,
      title,
      artist,
      album: id3Tags.album,
      weight: 0,
      timestamps: {
        createdAt: now,
        updatedAt: now,
        addedAt: now,
      },
      mediaInfo: {
        duration: null,
      },
      url: await urlPromise,
    };

    return this.#createOne(newDocOdm);
  }

  async #createOne(musicVo: MusicVO): Promise<Music> {
    const docOdm: DocOdm = await ModelOdm.create<MusicVO>(musicVo);
    const ret = musicDocOdmToModel(docOdm);
    const event = new ModelEvent<MusicVO>(EventType.CREATED, {
      entity: ret,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }

  async updateHashOf(music: Music) {
    const hash = await md5FileAsync(getFullPath(music.path));

    await this.updateOneByPath(music.path, {
      ...music,
      hash,
    } );

    return hash;
  }

  async findOrCreateOneFromPath(relativePath: string): Promise<Music> {
    const read = await this.findOneByPath(relativePath);

    if (read)
      return read;

    return this.createOneFromPath(relativePath);
  }

  async findOrCreateOneFromYoutube(strId: string): Promise<Music> {
    const data = await download(strId);

    return this.findOrCreateOneFromPath(data.file);
  }

  async deleteOneByPath(relativePath: string) {
    const docOdm = await ModelOdm.findOneAndDelete( {
      path: relativePath,
    } );

    if (!docOdm)
      return;

    const model = musicDocOdmToModel(docOdm);
    const event = new ModelEvent<MusicVO>(EventType.DELETED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  async updateOneByUrl(url: string, data: Partial<Music>): Promise<void> {
    return await this.#updateOne( {
      url,
    }, data);
  }

  updateOneByHash(hash: string, data: Partial<Music>): Promise<void> {
    return this.#updateOne( {
      hash,
    }, data);
  }

  async #updateOne(
    query: NonNullable<Parameters<typeof ModelOdm.updateOne>[0]>,
    data: Partial<Music>,
  ) {
    setUpdatedAtNow(data);
    await ModelOdm.updateOne(query, data);

    const queryAfter = applyChangesToQuery(query, data);
    const model = await this.#findOne(queryAfter);

    assertIsDefined(model);
    const event = new ModelEvent<MusicVO>(EventType.UPDATED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  updateOneByPath(relativePath: string, data: Partial<Music>): Promise<void> {
    return this.#updateOne( {
      path: relativePath,
    }, data);
  }
}

function getTitleFromFilenamePath(relativePath: string): string {
  let title = path.basename(relativePath);

  title = removeExtension(title);

  return fixTitle(title);
}

function removeExtension(str: string): string {
  for (const ext of AUDIO_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substr(0, index);
  }

  return str;
}

function fixTitle(title: string): string {
  return title.replace(/ \((Official )?(Lyric|Music) Video\)/ig, "")
    .replace(/\(videoclip\)/ig, "")
    .replace(/ $/g, "");
}

function setUpdatedAtNow(data: Partial<Music>) {
  data.timestamps ??= {} as Music["timestamps"];
  data.timestamps.updatedAt = new Date();
}

function applyChangesToQuery<T extends object>(
  query: T,
  changes: Record<string, unknown>,
): T {
  const result: any = Array.isArray(query)
    ? [...query]
    : {
      ...query,
    };

  // eslint-disable-next-line no-restricted-syntax
  for (const key in query) {
    if (key in changes) {
      const value = changes[key];
      const original = query[key];

      if (key in changes && typeof value === "object"
        && key in query && original !== null && typeof original === "object")
        result[key] = applyChangesToQuery(original, value as any);
      else
        result[key] = value;
    }
  }

  return result;
}
