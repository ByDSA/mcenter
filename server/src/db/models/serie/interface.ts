import { LocalResourceInterface } from "../resource/interface";
import { VideoInterface } from "../video";

export default interface Interface extends LocalResourceInterface {
  episodes: VideoInterface[];
}
