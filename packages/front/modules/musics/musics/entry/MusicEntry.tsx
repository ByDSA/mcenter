import { useCallback } from "react";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { Body, BodyProps } from "./body/Body";
import { Header } from "./Header";

type Props = Omit<BodyProps, "setData"> & Partial<Pick<BodyProps, "setData">> & {
  contextMenu?: ContextMenuProps;
};
export function MusicEntryElement(
  props: Props,
) {
  const updateIsFav = useCallback((_: string, favorite: boolean) => {
    if (props.data.isFav !== favorite) {
      props.setData?.( {
        ...props.data,
        isFav: favorite,
      } );
    }
  }, [props.setData, props.data]);

  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry: props.data,
          contextMenu: props.contextMenu,
          updateFavButtons: updateIsFav,
        } ),
        bodyContent: Body( {
          ...props,
          // eslint-disable-next-line no-empty-function
          setData: props.setData ?? (()=>{ } ),
        } ),
      } )
    }
  </span>;
}
