import { SerieId } from "#modules/series";

/**
 * @deprecated
 */
export interface OldDocOdm {
  id: string;
  path: string;
  title?: string;
  weight?: number;
  start?: number;
  end?: number;
  duration?: number;
  tags?: string[];
  disabled?: boolean;
}

/**
 * @deprecated
 */
export interface DocODM {
  id: SerieId;
  name: string;
  episodes: OldDocOdm[];
}
