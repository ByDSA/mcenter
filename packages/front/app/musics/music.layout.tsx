/* eslint-disable import/no-default-export */
import { PATH_ROUTES } from "$shared/routing";
import { PageContainer } from "#modules/ui-kit/layouts/PageContainer/PageContainer";
import { TabsContainer } from "#modules/ui-kit/layouts/TabsContainer/TabsContainer";
import { useUser } from "#modules/core/auth/useUser";
import { MenuItemData } from "#modules/ui-kit/menus/Sidebar";
import { PageContent } from "#modules/ui-kit/layouts/PageContainer/PageContent";
import styles from "./Page.module.css";
import { SearchBar } from "./search/SearchBar";

type Props = {
  children: React.ReactNode;
};

export default function MusicLayout( { children }: Props) {
  const data: MenuItemData[] = [];
  const { user } = useUser();

  if (user) {
    data.push(
      {
        label: "Listas",
        path: PATH_ROUTES.musics.frontend.playlists.path,
        matchPath: {
          customMatch: (p) => {
            const playlistsPath = PATH_ROUTES.musics.frontend.playlists.path;
            const smartPlaylistsPath = PATH_ROUTES.musics.frontend.smartPlaylists.path;

            return p.startsWith(playlistsPath) || p.startsWith(smartPlaylistsPath);
          },
        },
      },
      {
        label: "Historial",
        path: PATH_ROUTES.musics.frontend.history.path,
      },
      {
        label: "Subir",
        path: "/musics/upload",
      },
    );
  }

  const before = <span className={styles.searchBar}>
    <SearchBar />
  </span>;

  return <TabsContainer data={data} before={before} className={styles.tabs}>
    <PageContainer>
      <PageContent>
        {children}
      </PageContent>
    </PageContainer>
  </TabsContainer>;
}
