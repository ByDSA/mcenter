import { z } from "zod";

const infoElementSchema = z.object( {
  "#text": z.string()
    .or(z.number())
    .optional(),
  "@_name": z.string(),
} ).strict();
const categoryObjectSchema = z.object( {
  info: z.array(infoElementSchema)
    .or(infoElementSchema)
    .optional(), // cuando está parado, no hay info, o cuando solo hay una, a veces es un objeto
  "@_name": z.string(),
} ).strict();
const statusResponseSchema = z.object( {
  root: z.object( {
    length: z.number()
      .step(1)
      .gte(-1), // cuando no se ha cargado, puede ser < 0
    audiodelay: z.number(),
    position: z.number().nonnegative(),
    time: z.number(), // a veces con el seek se pueden poner valores negativos
    audiofilters: z.object( {
      // eslint-disable-next-line camelcase
      filter_0: z.string(), // puede haber filter_1, filter_2, etc
    } ).optional(), // si no se está reproduciendo, no hay audiofilters
    rate: z.number().nonnegative(),
    apiversion: z.number().nonnegative(),
    fullscreen: z.number()
      .or(z.boolean())
      .optional(),
    random: z.boolean(),
    equalizer: z.string(),
    repeat: z.boolean(),
    state: z.enum(["playing", "paused", "stopped"]),
    currentplid: z.number(), // -1 si no hay nada cargado
    version: z.string(),
    subtitledelay: z.number(),
    loop: z.boolean(),
    videoeffects: z.object( {
      contrast: z.number(),
      brightness: z.number(),
      hue: z.number(),
      saturation: z.number(),
      gamma: z.number(),
    } ).strict(),
    volume: z.number(),
    information: z.object( {
      category: z.array(categoryObjectSchema).or(categoryObjectSchema),
    } ).strict(),
    stats: z.object( {
      demuxdiscontinuity: z.number(),
      sendbitrate: z.number(),
      displayedpictures: z.number(),
      readbytes: z.number(),
      demuxreadpackets: z.number(),
      decodedvideo: z.number(),
      sentbytes: z.number(),
      demuxreadbytes: z.number(),
      averageinputbitrate: z.number(),
      readpackets: z.number(),
      averagedemuxbitrate: z.number(),
      lostabuffers: z.number(),
      inputbitrate: z.number(),
      sentpackets: z.number(),
      decodedaudio: z.number(),
      playedabuffers: z.number(),
      demuxbitrate: z.number(),
      lostpictures: z.number(),
      demuxcorrupted: z.number(),
    } ).strict()
      .or(z.string()), // cuando está parado, es un string
  } ),
} ).strict();

export type StatusResponse = z.infer<typeof statusResponseSchema>;

export type InfoStatusResponse = z.infer<typeof infoElementSchema>;

export type CategoryObject = z.infer<typeof categoryObjectSchema>;

export type InfoObject = z.infer<typeof infoElementSchema>;

export function assertIsStatusResponse(obj: unknown): asserts obj is StatusResponse {
  statusResponseSchema.parse(obj);
}
