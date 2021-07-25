import { TimestampInterface } from "../timestamp";

export interface ResourceInterface extends TimestampInterface {
  url: string;
  name: string;
  tags?: string[];
  disabled?: boolean;
}

export interface LocalResourceFileInterface extends ResourceInterface {
  hash: string;
}

export interface LocalResourceInterface extends ResourceInterface {
  path: string;
}

export interface MultimediaLocalResourceInterface
extends LocalResourceInterface, LocalResourceFileInterface {
  duration?: number;
  start?: number;
  end?: number;
}
