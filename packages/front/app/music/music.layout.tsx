/* eslint-disable import/no-default-export */
import { PageContainer, PageContainerProps } from "app/PageContainer";
import { makeMenu } from "#modules/menus";

type MusicLayoutProps = {
  pageContainerProps?: PageContainerProps;
};
type Props = {
  children: React.ReactNode;
  props?: MusicLayoutProps;
};

export default function MusicLayout( { children, props }: Props) {
  const submenu = makeMenu( {
    "/music/history": "Historial",
    "/music/search": "Buscar",
    "/music/playlists": "Playlists",
    "/music/upload": "Subir",
  }, {
    type: "sub",
  } );

  return (
    <>
      {submenu}
      <PageContainer props={props?.pageContainerProps}>
        <h1>Música</h1>
        {children}
      </PageContainer>
    </>);
}
