import { PlaylistEntity } from "../Playlist";
import { PlaylistSelectorItem } from "./Item";

type Props = {
  data: PlaylistEntity[];
  onSelect?: (playlist: PlaylistEntity)=> void;
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
