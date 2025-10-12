import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";

export const APP_CONFIG = {
  AppName: "MCenter",
  SupportEmail: "support@mcenter.com",
  EmailVerification: {
    TokenExpirationTime: 60 * 60,
    MinMailInterval: 1 * 60, // 1 mins
    MaxCount: 3,
  },
};

export namespace ConfigOdm {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const COLLECTION_NAME = COLLECTION;
};
