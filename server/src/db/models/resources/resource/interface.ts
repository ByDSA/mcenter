import { TimestampInterface } from "@models/timestamp";

export interface ResourceInterface extends TimestampInterface {
  _id?: any;
  url: string;
  name: string;
  tags?: string[];
  disabled?: boolean;
}

export interface LocalResourceInterface extends ResourceInterface {
  path: string;
}

export interface LocalResourceFileInterface extends LocalResourceInterface {
  hash: string;
}

export interface MultimediaLocalResourceInterface extends LocalResourceFileInterface {
  duration?: number;
  start?: number;
  end?: number;
}
