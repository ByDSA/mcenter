import { Music, MusicEntity, assertIsMusic, assertIsMusicEntity } from "$shared/models/musics";
import { assertIsMusicFileInfoEntity, MusicFileInfoEntity } from "$shared/models/musics/file-info";
import mongoose, { Schema, Types } from "mongoose";

export interface DocOdm extends Omit<Music, "id"> {
  _id: mongoose.Types.ObjectId;
  onlyTags?: string[];
}


const NAME = "Music";

type TimestampsModel = {
    createdAt: Date;
    updatedAt: Date;
    addedAt: Date;
    releasedOn: string;
};
export const timestampsSchemaOdm = new mongoose.Schema<TimestampsModel>( {
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  addedAt: {
    type: Date,
    required: false,
  },
  releasedOn: {
    type: String,
    required: false,
  },
} );

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  timestamps: {
    type: timestampsSchemaOdm,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
  },
  tags: {
    type: [String],
    required: false,
    default: undefined,
  },
  onlyTags: {
    type: [String],
    required: false,
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
  lastTimePlayed: {
    type: Number,
  },
  game: {
    type: String,
  },
  country: {
    type: String,
  },
  year: {
    type: Number,
  },
  spotifyId: {
    type: String,
    required: false,
  },
} );

export const ModelOdm = mongoose.model<Music>(NAME, schemaOdm);


function docOdmToModelTags(docOdm: DocOdm): string[] | undefined {
  if (!docOdm.tags && !docOdm.onlyTags)
    return undefined;

  let tags: string[] | undefined;

  if (docOdm.tags)
    tags = [...docOdm.tags];

  if (docOdm.onlyTags) {
    if (!tags)
      tags = [];

    tags.push(...docOdm.onlyTags.map((tag) => `only-${tag}`));

    return tags;
  }

  return tags;
}

export function musicDocOdmToEntity(docOdm: DocOdm): MusicEntity {
  const model: MusicEntity = {
    id: docOdm._id.toString(),
    title: docOdm.title,
    url: docOdm.url,
    weight: docOdm.weight,
    artist: docOdm.artist,
    tags: docOdmToModelTags(docOdm),
    disabled: docOdm.disabled,
    lastTimePlayed: docOdm.lastTimePlayed,
    timestamps: {
      createdAt: docOdm.timestamps.createdAt,
      updatedAt: docOdm.timestamps.updatedAt,
      addedAt: docOdm.timestamps.addedAt,
    },
    album: docOdm.album,
    country: docOdm.country,
    game: docOdm.game,
    year: docOdm.year,
  };

  assertIsMusic(model);

  return model;
}

export {
  assertIsMusic,
  assertIsMusicEntity,
}

export type MusicFileInfoDocOdm = {
  _id?: Types.ObjectId;
  musicId: Types.ObjectId;
  path: string;
  hash: string;
  size: number;
  mediaInfo: {
    duration: number | null;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
};

type MusicFileInfoFullDocOdm = MusicFileInfoDocOdm & Required<Pick<DocOdm, "_id">>;
export function musicFileInfoDocOdmToEntity(docOdm: MusicFileInfoFullDocOdm): MusicFileInfoEntity {
  const ret: MusicFileInfoEntity = {
    id: docOdm._id.toString(),
    musicId: docOdm.musicId.toString(),
    path: docOdm.path ?? null,
    hash: docOdm.hash,
    size: docOdm.size,
    timestamps: {
      createdAt: docOdm.timestamps?.createdAt,
      updatedAt: docOdm.timestamps?.updatedAt,
    },
    mediaInfo: {
      duration: docOdm.mediaInfo?.duration ?? null,
    },
  };

  return ret;
}

export {
  assertIsMusicFileInfoEntity
}



export const MusicFileInfoschemaOdm = new mongoose.Schema<MusicFileInfoDocOdm>( {
  musicId: {
    type: Schema.ObjectId,
    required: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    unique: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mediaInfo: {
    duration: {
      type: Number,
      default: null,
    },
  },
  timestamps: {
    createdAt: Date,
    updatedAt: Date,
  },
}, {
  autoIndex: false,
} );


const MusicFileInfoNAME = "MusicFileInfo";

export const MusicFileInfoModelOdm = mongoose.model<MusicFileInfoDocOdm>(MusicFileInfoNAME, MusicFileInfoschemaOdm);