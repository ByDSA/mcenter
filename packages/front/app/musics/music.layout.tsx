/* eslint-disable import/no-default-export */
import { PATH_ROUTES } from "$shared/routing";
import { PageContainer } from "app/PageContainer";
import { TabsContainer } from "app/TabsContainer";
import { useUser } from "#modules/core/auth/useUser";
import styles from "./Page.module.css";
import { SearchBar } from "./search/SearchBar";

type Props = {
  children: React.ReactNode;
};

export default function MusicLayout( { children }: Props) {
  const data: {label: string;
path: string;}[] = [];
  const { user } = useUser();

  if (user) {
    data.push( {
      label: "Historial",
      path: PATH_ROUTES.musics.frontend.history.path,
    } );
  }

  if (user) {
    data.push(
      {
        label: "Playlists",
        path: PATH_ROUTES.musics.frontend.playlists.path,
      },
      {
        label: "Subir",
        path: "/musics/upload",
      },
    );
  }

  const before = <span className={styles.searchBar}><SearchBar /></span>;

  return (
    <>
      <TabsContainer data={data} before={before} className={styles.tabs}>
        <PageContainer>
          {children}
        </PageContainer>
      </TabsContainer>
    </>);
}
