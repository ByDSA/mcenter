import { LocalResourceInterface } from "../resource/interface";
import { VideoInterface } from "../video";

export type Episode = VideoInterface;

export default interface Interface extends LocalResourceInterface {
  episodes: Episode[];
}
