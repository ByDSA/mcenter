import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { ARTIST_EMPTY, Music, MusicID, MusicVO } from "#shared/models/musics";
import { assertIsDefined } from "#shared/utils/validation";
import { md5FileAsync } from "#utils/crypt";
import { EventType, ModelEvent, PatchEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanGetOneById, CanPatchOneById } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";
import { statSync } from "fs";
import NodeID3 from "node-id3";
import path from "path";
import { AUDIO_EXTENSIONS } from "../files";
import { QUEUE_NAME as HISTORY_QUEUE_NAME } from "../history/events";
import { Model as HistoryMusicEntry } from "../history/models";
import { getFullPath } from "../utils";
import { download } from "../youtube";
import { musicDocOdmToModel, patchParamsToUpdateQuery } from "./adapters";
import { QUEUE_NAME } from "./events";
import { DocOdm, ModelOdm } from "./odm";
import { findParamsToQueryParams } from "./queries/QueriesOdm";
import { ExpressionNode } from "./queries/QueryObject";
import { PatchOneParams } from "./types";
// eslint-disable-next-line import/no-cycle
import UrlGenerator from "./UrlGenerator";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class MusicRepository
implements CanPatchOneById<Music, MusicID, PatchOneParams>,
CanGetOneById<Music, MusicID>
{
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } );

    this.#deps.domainMessageBroker.subscribe(HISTORY_QUEUE_NAME, async (_ev: Event<unknown>) => {
      const event = _ev as ModelEvent<HistoryMusicEntry>;

      if (event.type !== EventType.CREATED)
        return;

      const id = event.payload.entity.resourceId;
      const lastTimePlayed = event.payload.entity.date.timestamp;

      await this.patchOneById(id, {
        entity: {
          lastTimePlayed,
        },
      } );
    } );
  }

  async getOneById(id: string): Promise<Music | null> {
    const docOdm = await ModelOdm.findById(id);

    if (!docOdm)
      return null;

    return musicDocOdmToModel(docOdm);
  }

  async patchOneById(id: string, params: PatchOneParams): Promise<void> {
    const {entity} = params;
    const updateQuery = patchParamsToUpdateQuery(params);

    await ModelOdm.findByIdAndUpdate(id, updateQuery);

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const [k, value] of Object.entries(entity)) {
      const key = k as keyof Music;
      const event = new PatchEvent<Music, MusicID>( {
        entityId: id,
        key,
        value,
      } );

      await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
    }

    for (const p of params.unset ?? []) {
      const event = new PatchEvent<Music, MusicID>( {
        entityId: id,
        key: p.join(".") as keyof Music,
        value: undefined,
      } );

      await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
    }
  }

  async findByHash(hash: string): Promise<Music | null> {
    const musicOdm: DocOdm | null = await ModelOdm.findOne( {
      hash,
    } );

    if (!musicOdm)
      return null;

    return musicDocOdmToModel(musicOdm);
  }

  async findByUrl(url: string): Promise<Music | null> {
    const music: DocOdm | null = await ModelOdm.findOne( {
      url,
    } );

    if (!music)
      return null;

    return musicDocOdmToModel(music);
  }

  async findAll(): Promise<Music[]> {
    const docOdms = await ModelOdm.find( {
    } );
    const ret = docOdms.map((docOdm) => musicDocOdmToModel(docOdm));

    return ret;
  }

  async find(params: ExpressionNode): Promise<Music[]> {
    const query = findParamsToQueryParams(params);
    const docOdms = await ModelOdm.find(query);
    const ret = docOdms.map((docOdm) => musicDocOdmToModel(docOdm));

    return ret;
  }

  async findByPath(relativePath: string): Promise<Music | null> {
    const docOdm = await ModelOdm.findOne( {
      path: relativePath,
    } );

    if (!docOdm)
      return null;

    return musicDocOdmToModel(docOdm);
  }

  async createFromPath(relativePath: string): Promise<Music> {
    const fullPath = getFullPath(relativePath);
    const id3Tags = NodeID3.read(fullPath);
    const title = id3Tags.title ?? getTitleFromFilenamePath(fullPath);
    const artist = id3Tags.artist ?? ARTIST_EMPTY;
    const urlGenerator = new UrlGenerator( {
      musicRepository: this,
    } );
    const urlPromise = urlGenerator.generateAvailableUrlFrom( {
      title,
      artist,
    } );
    const hashPromise = md5FileAsync(fullPath);
    const {size} = statSync(fullPath);
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
    const docOdm: DocOdm = await ModelOdm.create<MusicVO>(newDocOdm);
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

  async findOrCreateFromPath(relativePath: string): Promise<Music> {
    const read = await this.findByPath(relativePath);

    if (read)
      return read;

    return this.createFromPath(relativePath);
  }

  async findOrCreateFromYoutube(strId: string): Promise<Music> {
    const data = await download(strId);

    return this.findOrCreateFromPath(data.file);
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
    await ModelOdm.updateOne( {
      url,
    }, data);

    const model = await this.findByUrl(url);

    assertIsDefined(model);
    const event = new ModelEvent<MusicVO>(EventType.UPDATED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  async updateOneByHash(hash: string, data: Partial<Music>): Promise<void> {
    await ModelOdm.updateOne( {
      hash,
    }, data);

    const model = await this.findByHash(hash);

    assertIsDefined(model);

    const event = new ModelEvent<MusicVO>(EventType.UPDATED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  async updateOneByPath(relativePath: string, data: Partial<Music>): Promise<void> {
    await ModelOdm.updateOne( {
      path: relativePath,
    }, data);

    const model = await this.findByPath(data.path ?? relativePath);

    assertIsDefined(model);
    const event = new ModelEvent<MusicVO>(EventType.UPDATED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
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
  return title.replace(/ \((Official )?(Lyric|Music) Video\)/ig,"")
    .replace(/\(videoclip\)/ig,"")
    .replace(/ $/g,"");
}