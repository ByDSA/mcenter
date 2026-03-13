import { MusicPlaylistEntity } from "../models";
import { PlaylistSelectorItem } from "./Item";

export type PlayListSelectorIsAddedFn = (data: MusicPlaylistEntity)=> boolean;

type Props = {
  data: MusicPlaylistEntity[];
  isAdded?: PlayListSelectorIsAddedFn;
  onSelect?: (playlist: MusicPlaylistEntity)=> void;
};
export const PlaylistSelector = (props: Props) =>{
  return <div>
    {
      props.data.map(d=>{
        const contained = props.isAdded ? props.isAdded(d) : undefined;

        return <PlaylistSelectorItem
          key={d.name}
          data={d}
          isAdded={contained}
          onClick={()=> props.onSelect?.(d)}
        />;
      } )
    }
    {
      props.data.length === 0 && <p>No hay ninguna playlist creada.</p>
    }
  </div>;
};
