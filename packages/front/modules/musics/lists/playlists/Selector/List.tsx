import { MusicPlaylistEntity } from "../models";
import { PlaylistSelectorItem } from "./Item";

type Props = {
  data: MusicPlaylistEntity[];
  onSelect?: (playlist: MusicPlaylistEntity)=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistSelector = (props: Props) =>{
  return <div>
    {
      props.data.map(d=><PlaylistSelectorItem
        key={d.name}
        data={d}
        onClick={()=> props.onSelect?.(d)}
      />)
    }
    {
      props.data.length === 0 && <p>No hay ninguna playlist creada.</p>
    }
  </div>;
};
